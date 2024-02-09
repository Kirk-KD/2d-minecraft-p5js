import { BLOCK_SIZE, CHUNK_WIDTH, LIGHT_DISTANCE } from "./config.js";
import { blocksTextures } from "./assets.js";
// import getHeightAtX from "./noise.js";
import Utils from "./utils.js";

export const BlockType = {
  AIR: "air",
  DIRT: "dirt",
  GRASS: "grass",
};

export class Block {
  constructor(world, columnHeight, chunkXIndex, localXIndex, yIndex, type) {
    this.world = world;
    this.columnHeight = columnHeight;
    this.chunkXIndex = chunkXIndex;

    this.localXIndex = localXIndex;
    this.globalXIndex = this.chunkXIndex * CHUNK_WIDTH + this.localXIndex;

    this.yIndex = yIndex;

    this.screenX = this.globalXIndex * BLOCK_SIZE;
    this.screenY = this.yIndex * BLOCK_SIZE;

    this.type = type || BlockType.AIR;

    this.shadowLevel = this.getShadowLevel();
  }

  draw(p5) {
    if (this.type === BlockType.AIR) return;

    if (this.shadowLevel <= 0.99)
      p5.image(blocksTextures[this.type], this.screenX, this.screenY);

    if (this.shadowLevel > 0.01) {
      p5.fill(0, 0, 0, 255 * this.shadowLevel);
      p5.rect(this.screenX, this.screenY, BLOCK_SIZE, BLOCK_SIZE);
    }
  }

  drawDebug(p5) {
    p5.stroke(0);
    p5.fill(255);
    p5.text(
      `${this.type} (${this.globalXIndex},${this.yIndex}) Shadow: ${this.shadowLevel}`,
      this.screenX,
      this.screenY - 10,
    );
    p5.stroke(255, 0, 0);
    p5.noFill();
    p5.square(this.screenX, this.screenY, BLOCK_SIZE);
    p5.noStroke();
  }

  getShadowLevel() {
    // const maxH = this.world.terrainGenerator.getHeight(this.globalXIndex);
    let smooth = this.columnHeight;
    const limit = 3;
    for (let i = 1; i <= limit; i++) {
      smooth += (
        this.world.getBlockAtBlockIndex(this.globalXIndex - i, this.yIndex) ||
        this
      ).columnHeight;
      smooth += (
        this.world.getBlockAtBlockIndex(this.globalXIndex + i, this.yIndex) ||
        this
      ).columnHeight;
    }
    smooth /= 2 * limit + 1;
    return Utils.clamp((this.yIndex - smooth) / LIGHT_DISTANCE, 0, 1);
  }
}
