import {
  CHUNK_WIDTH,
  MAX_HEIGHT,
  WIDTH,
  HEIGHT,
  BLOCK_SIZE,
} from "./config.js";
import { Block, BlockType } from "./block.js";
// import getHeightAtX from "./noise.js";

export default class Chunk {
  constructor(world, xIndex) {
    this.world = world;
    this.xIndex = xIndex;
    this.blocks = new Array(CHUNK_WIDTH);
    for (let x = 0; x < CHUNK_WIDTH; x++) {
      this.blocks[x] = new Array(MAX_HEIGHT);
      const maxY = this.world.terrainGenerator.getHeight(
        x + this.xIndex * CHUNK_WIDTH,
      );
      for (let y = 0; y < MAX_HEIGHT; y++) {
        if (y > maxY)
          this.blocks[x][y] = new Block(
            this.world,
            maxY,
            this.xIndex,
            x,
            y,
            BlockType.DIRT,
          );
        else if (y == maxY)
          this.blocks[x][y] = new Block(
            this.world,
            maxY,
            this.xIndex,
            x,
            y,
            BlockType.GRASS,
          );
        else
          this.blocks[x][y] = new Block(
            this.world,
            maxY,
            this.xIndex,
            x,
            y,
            BlockType.AIR,
          );
      }
    }
  }

  draw(p5, camera) {
    for (let x = 0; x < CHUNK_WIDTH; x++) {
      const disX = this.#blockXIndexToDisplay(x, camera);
      if (disX < -BLOCK_SIZE || disX > WIDTH) continue;

      for (let y = 0; y < MAX_HEIGHT; y++) {
        const disY = this.#blockYIndexToDisplay(y, camera);
        if (disY < -BLOCK_SIZE || disY > HEIGHT) continue;

        this.blocks[x][y].draw(p5);
      }
    }
  }

  #blockXIndexToDisplay(blockXIndex, camera) {
    return (
      (blockXIndex + this.xIndex * CHUNK_WIDTH - camera.x) * BLOCK_SIZE +
      WIDTH * 0.5
    );
  }

  #blockYIndexToDisplay(blockYIndex, camera) {
    return (blockYIndex + camera.y) * BLOCK_SIZE + HEIGHT * 0.5;
  }
}
