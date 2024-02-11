import { Block, BlockType } from "./block.js";
import { CHUNK_WIDTH, MAX_HEIGHT } from "./config.js";

export default class LightingCalculation {
  constructor(world, player) {
    this.world = world;
    this.player = player;
  }

  traceSkyLight(startX, slope) {
    let x = startX + 0.1;
    let y = 0.1;

    let dx, dy;
    if (slope > 1) {
      dx = 1 / slope;
      dy = 1;
    } else if (slope < 1) {
      dx = 1;
      dy = slope;
    }

    let light = 1;
    let shadedBlocks = [];
    while (y < MAX_HEIGHT) {
      const block = this.world.getBlockAtBlockIndex(x, y);

      if (block) {
        block.lightLevel = light;
        if (light === 0) {
          shadedBlocks.push(block);
          // console.log("pushed");
        }
      }
      if (Block.hasCollision(block)) {
        light = 0;
      }

      // console.log(
      //   x,
      //   y,
      //   dx,
      //   dy,
      //   block ? block.lightLevel : null,
      //   block ? block.type : null,
      // );

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
      (neighbor.type === BlockType.AIR ? 0.8 : 0.5) -
      (recipient.xIndex !== neighbor.xIndex &&
      recipient.yIndex !== neighbor.yIndex
        ? 0.41
        : 0)
    );
  }

  updateLightLevels() {
    const [start, stop] = this.world.getChunkGenerationRange(this.player.x);
    let shadedBlocks = [];

    for (let i = start * CHUNK_WIDTH; i < stop * CHUNK_WIDTH; i += 0.5) {
      shadedBlocks = shadedBlocks.concat(this.traceSkyLight(i, 5));
    }

    this.#fillLight(shadedBlocks, [], shadedBlocks[0]);
  }
}
