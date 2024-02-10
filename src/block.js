import { BLOCK_SIZE, CHUNK_WIDTH, LIGHT_DISTANCE } from "./config.js";
import { blocksTextures, textures } from "./assets.js";
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

    this.breakTime = 1;

    this.localXIndex = localXIndex;
    this.xIndex = this.chunkXIndex * CHUNK_WIDTH + this.localXIndex;

    this.yIndex = yIndex;

    this.screenX = this.xIndex * BLOCK_SIZE;
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

  drawHighlight(p5) {
    p5.stroke(0);
    p5.strokeWeight(2);
    p5.noFill();
    p5.square(this.screenX, this.screenY, BLOCK_SIZE);
  }

  drawCracks(p5, percent) {
    p5.tint(255, 230);
    p5.image(
      textures.cracks[Math.floor(percent * textures.cracks.length)],
      this.screenX,
      this.screenY,
    );
    p5.noTint();
  }

  drawDebug(p5) {
    p5.stroke(0);
    p5.fill(255);
    p5.text(
      `${this.type} (${this.xIndex},${this.yIndex}) Shadow: ${this.shadowLevel}`,
      this.screenX,
      this.screenY - 10,
    );
    p5.stroke(255, 0, 0);
    p5.noFill();
    p5.square(this.screenX, this.screenY, BLOCK_SIZE);
    p5.noStroke();
  }

  getShadowLevel() {
    let smooth = this.columnHeight;
    const limit = 3;
    for (let i = 1; i <= limit; i++) {
      smooth += (
        this.world.getBlockAtBlockIndex(this.xIndex - i, this.yIndex) || this
      ).columnHeight;
      smooth += (
        this.world.getBlockAtBlockIndex(this.xIndex + i, this.yIndex) || this
      ).columnHeight;
    }
    smooth /= 2 * limit + 1;
    return Utils.clamp((this.yIndex - smooth) / LIGHT_DISTANCE, 0, 1);
  }

  static canHighlight(block) {
    return block && block.type !== BlockType.AIR;
  }

  static canBreak(block) {
    return block && block.type !== BlockType.AIR && block.breakTime > 0;
  }

  static hasCollision(block) {
    return block && block.type !== BlockType.AIR ? block : false;
  }
}
