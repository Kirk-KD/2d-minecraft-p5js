import { Block, BlockType } from "./block.js";
import Utils from "./utils.js";
import {
  CHUNK_WIDTH,
  HEIGHT,
  MAX_HEIGHT,
  BLOCK_SIZE,
  MAX_SKY_LIGHT,
  MIN_SKY_LIGHT,
} from "./config.js";

export default class LightingCalculation {
  constructor(world, player, sunDegrees) {
    this.world = world;
    this.player = player;
    this.sunDegrees = sunDegrees;

    this.skyLightLevel = MAX_SKY_LIGHT;
  }

  #getSunSlope() {
    return this.sunDegrees === 90
      ? null
      : Math.tan((Math.PI / 180) * this.sunDegrees);
  }

  #traceSkyLight(startX, slope) {
    const maxY = Math.min(
      Math.ceil(this.player.y + (1.5 * HEIGHT) / BLOCK_SIZE),
      MAX_HEIGHT,
    );
    const minY = Math.max(
      Math.floor(this.player.y - (2 * HEIGHT) / BLOCK_SIZE),
      0,
    );

    let xOffset = -(1 / slope) * maxY;
    let dx, dy;

    if (slope === null) {
      dx = 0;
      dy = 1;
    } else {
      if (Math.abs(slope) > 1) {
        dx = 1 / slope;
        dy = 1;
      } else if (Math.abs(slope) < 1) {
        dx = 1 * (slope / Math.abs(slope));
        dy = slope;
      } else {
        dx = 1;
        dy = 1;
      }
    }

    let x = xOffset + startX;
    let y = 0;

    let light = this.skyLightLevel;
    let shadedBlocks = [];
    while (y < maxY) {
      const block = this.world.getBlockAtBlockIndex(x, y);

      if (block) {
        block.lightLevel = light;
        if (y > minY && light === 0) shadedBlocks.push(block);
        if (!block.isBackground)
          light = Utils.clamp(light - block.opacity, 0, 1);
      }

      x += dx;
      y += dy;
    }

    return shadedBlocks;
  }

  #fillLight(shadedBlocks, visited, block) {
    if (!block) return;

    if (visited.includes(block)) return block.lightLevel; // block already calculated

    visited.push(block);

    const neighbors = block.getNeighbors();
    neighbors.forEach((b) => {
      // neighbor already/is to be calculated in recursive algorithm
      if (shadedBlocks.includes(b))
        block.lightLevel = Math.max(
          block.lightLevel,
          this.#fillLight(shadedBlocks, visited, b) *
            this.#diffuseLightFactor(block, b),
        );
      // neighbor already calculated in iterative algorithm
      else
        block.lightLevel = Math.max(
          block.lightLevel,
          b.lightLevel * this.#diffuseLightFactor(block, b),
        );
    });

    return block.lightLevel;
  }

  #diffuseLightFactor(recipient, neighbor) {
    return (
      (neighbor.type === BlockType.AIR ? 0.9 : 0.5) -
      (recipient.xIndex !== neighbor.xIndex &&
      recipient.yIndex !== neighbor.yIndex
        ? 0.41
        : 0)
    );
  }

  updateLightLevels() {
    if (this.sunDegrees <= 0 || this.sunDegrees >= 180) return;

    const slope = this.#getSunSlope();
    const [start, stop] = this.world.getChunkGenerationRange(
      Math.floor(this.player.x),
    );
    let shadedBlocks = [];

    for (
      let i = start * CHUNK_WIDTH;
      i < (stop + 1) * CHUNK_WIDTH + CHUNK_WIDTH;
      i += 0.5
    ) {
      shadedBlocks = shadedBlocks.concat(this.#traceSkyLight(i, slope));
    }

    this.#fillLight(shadedBlocks, [], shadedBlocks[0]);
  }

  updateSun(millis) {
    const f = 0.000001;
    const a = MIN_SKY_LIGHT;
    const b = MAX_SKY_LIGHT;
    this.skyLightLevel =
      ((b - a) / 2) * Math.sin((2 * Math.PI * f * millis) / (b - a)) +
      (a + b) / 2;
  }
}
