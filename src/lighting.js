import { Block, BlockType } from "./block.js";
import { CHUNK_WIDTH, HEIGHT, MAX_HEIGHT, BLOCK_SIZE } from "./config.js";

export default class LightingCalculation {
  constructor(world, player, sunDegrees) {
    this.world = world;
    this.player = player;
    this.sunDegrees = sunDegrees;

    this.sunLastUpdated = 0;
  }

  #getSunSlope() {
    return this.sunDegrees === 90
      ? null
      : Math.tan((Math.PI / 180) * this.sunDegrees);
  }

  #traceSkyLight(startX, slope) {
    const maxY = Math.min(
      Math.ceil(this.player.y + (2 * HEIGHT) / BLOCK_SIZE),
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

    let x = xOffset + startX + 0.1;
    let y = 0.1;

    let light = 1;
    let shadedBlocks = [];
    while (y < maxY) {
      const block = this.world.getBlockAtBlockIndex(x, y);

      if (block) {
        block.lightLevel = light;
        if (y > minY && light === 0) shadedBlocks.push(block);
      }

      if (Block.hasCollision(block)) light = 0;

      x += dx;
      y += dy;
    }

    return shadedBlocks;
  }

  // #fillLight(shadedBlocks) {
  //   let determined = [];
  //   let stack = [shadedBlocks[0]];
  //   let block;

  //   while (stack.length > 0) {
  //     block = stack[stack.length - 1];

  //     if (determined.includes(block)) {
  //       stack.pop();
  //       continue;
  //     }

  //     const neighbors = block.getNeighbors();
  //     let completedNeighbors = 0;
  //     neighbors.forEach((neighbor) => {
  //       if (!shadedBlocks.includes(neighbor) || determined.includes(neighbor)) {
  //         // neighbor calculated
  //         block.lightLevel = Math.max(
  //           block.lightLevel,
  //           neighbor.lightLevel * this.#diffuseLightFactor(block, neighbor),
  //         );
  //         completedNeighbors++;
  //       } else if (!stack.includes(neighbor)) stack.push(neighbor); // neighbor needs to be calculated
  //     });
  //     if (completedNeighbors === neighbors.length) {
  //       determined.push(block);
  //     }
  //   }
  // }

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
    if (this.sunDegrees <= 0 || this.sunDegrees >= 180) return;

    const slope = this.#getSunSlope();
    const [start, stop] = this.world.getChunkGenerationRange(this.player.x);
    let shadedBlocks = [];

    for (
      let i = (start - 1) * CHUNK_WIDTH + 0.5;
      i < (stop + 1) * CHUNK_WIDTH;
      i += 0.5
    ) {
      shadedBlocks = shadedBlocks.concat(this.#traceSkyLight(i, slope));
    }

    this.#fillLight(shadedBlocks, [], shadedBlocks[0]);
  }

  updateSun() {
    if (Date.now() - this.sunLastUpdated >= 20000) {
      this.sunLastUpdated = Date.now();
      this.sunDegrees += 5;
      this.sunDegrees %= 360;
    }
  }
}
