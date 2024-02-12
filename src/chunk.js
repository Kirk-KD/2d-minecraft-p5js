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
    this.#generateBlocks();

    this.trees = [];
  }

  #generateBlocks() {
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

  generateTrees() {
    for (let localX = 1; localX < CHUNK_WIDTH - 1; localX++) {
      const globalX = this.xIndex * CHUNK_WIDTH + localX;

      // if (this.trees.includes(localX - 1)) continue;

      const columnHeight = this.blocks[localX][0].columnHeight;

      if (
        this.world.terrainGenerator.getTree(globalX) > 0.5 &&
        this.blocks[localX - 1][columnHeight - 1].type === BlockType.AIR &&
        this.blocks[localX + 1][columnHeight - 1].type === BlockType.AIR &&
        (this.trees.length === 0 ||
          Math.abs(this.trees[this.trees.length - 1] - localX) > 3)
      ) {
        this.blocks[localX][columnHeight - 1] = new Block(
          this.world,
          columnHeight,
          this.xIndex,
          localX,
          columnHeight - 1,
          BlockType.WOOD,
        );
        this.trees.push(localX);
      }

      if (this.trees.length > 5) break;
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
