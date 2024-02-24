import {
  CHUNK_WIDTH,
  MAX_HEIGHT,
  WIDTH,
  HEIGHT,
  BLOCK_SIZE,
} from "./config.js";
import { blocks, BlockType } from "./block.js";
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
      const maxStoneY = this.world.terrainGenerator.getStoneHeight(
        x + this.xIndex * CHUNK_WIDTH,
      );

      for (let y = 0; y < MAX_HEIGHT; y++) {
        const isCave =
          this.world.terrainGenerator.getCaveValue(
            x + this.xIndex * CHUNK_WIDTH,
            y,
          ) >= 0.65;

        if (isCave) this.setBlock(x, y, blocks.AirBlock);
        else if (y >= maxStoneY) this.setBlock(x, y, blocks.StoneBlock);
        else if (y > maxY) this.setBlock(x, y, blocks.DirtBlock);
        else if (y == maxY) this.setBlock(x, y, blocks.GrassBlock);
        else this.setBlock(x, y, blocks.AirBlock);
      }
    }
  }

  replaceBlock(localX, y, blockClass, isBackground) {
    const original = this.world.getBlockAtBlockIndex(
      this.xIndex * CHUNK_WIDTH + localX,
      y,
    );
    this.setBlock(
      localX,
      y,
      new blockClass(
        this.world,
        original.columnHeight,
        original.chunkXIndex,
        original.localXIndex,
        original.yIndex,
        isBackground,
      ),
    );
  }

  setBlock(localX, y, blockClass, isBackground) {
    if (localX < 0) {
      const chunkLeft = this.world.chunks.getAtXIndex(this.xIndex - 1);
      if (chunkLeft)
        chunkLeft.setBlock(CHUNK_WIDTH + localX, y, blockClass, isBackground);
    } else if (localX >= CHUNK_WIDTH) {
      const chunkRight = this.world.chunks.getAtXIndex(this.xIndex + 1);
      if (chunkRight)
        chunkRight.setBlock(localX - CHUNK_WIDTH, y, blockClass, isBackground);
    } else {
      this.blocks[localX][y] = new blockClass(
        this.world,
        this.world.terrainGenerator.getHeight(
          localX + this.xIndex * CHUNK_WIDTH,
        ),
        this,
        localX,
        y,
        isBackground,
      );
    }
  }

  generateTrees() {
    for (let localX = 1; localX < CHUNK_WIDTH - 1; localX++) {
      const globalX = this.xIndex * CHUNK_WIDTH + localX;

      const columnHeight = this.blocks[localX][0].columnHeight;

      if (
        this.world.terrainGenerator.getTree(globalX) > 0.5 &&
        (this.blocks[localX][columnHeight].type === BlockType.GRASS ||
          this.blocks[localX][columnHeight].type === BlockType.DIRT) &&
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
