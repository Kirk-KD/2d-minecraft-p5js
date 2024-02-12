import {
  CHUNK_WIDTH,
  MAX_HEIGHT,
  WIDTH,
  HEIGHT,
  BLOCK_SIZE,
} from "./config.js";
import { Block, BlockType } from "./block.js";
import { TREE_STRUCTURES } from "./generation.js";
import Utils from "./utils.js";

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
        if (y > maxY) this.setBlock(x, y, BlockType.DIRT);
        else if (y == maxY) this.setBlock(x, y, BlockType.GRASS);
        else this.setBlock(x, y, BlockType.AIR);
      }
    }
  }

  setBlock(localX, y, type) {
    if (localX < 0) {
      const chunkLeft = this.world.chunks.getAtXIndex(this.xIndex - 1);
      if (chunkLeft) chunkLeft.setBlock(CHUNK_WIDTH + localX, y, type);
    } else if (localX >= CHUNK_WIDTH) {
      const chunkRight = this.world.chunks.getAtXIndex(this.xIndex + 1);
      if (chunkRight) chunkRight.setBlock(localX - CHUNK_WIDTH, y, type);
    } else {
      this.blocks[localX][y] = new Block(
        this.world,
        this.world.terrainGenerator.getHeight(
          localX + this.xIndex * CHUNK_WIDTH,
        ),
        this.xIndex,
        localX,
        y,
        type,
      );
    }
  }

  generateTrees() {
    for (let localX = 1; localX < CHUNK_WIDTH - 1; localX++) {
      const globalX = this.xIndex * CHUNK_WIDTH + localX;

      const columnHeight = this.blocks[localX][0].columnHeight;

      if (
        this.world.terrainGenerator.getTree(globalX) > 0.5 &&
        this.blocks[localX][columnHeight].type !== BlockType.AIR &&
        this.blocks[localX - 1][columnHeight - 1].type === BlockType.AIR &&
        this.blocks[localX + 1][columnHeight - 1].type === BlockType.AIR &&
        (this.trees.length === 0 ||
          Math.abs(this.trees[this.trees.length - 1] - localX) > 3)
      ) {
        Utils.randChoice(TREE_STRUCTURES.oak).place(
          this,
          localX,
          columnHeight - 1,
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
