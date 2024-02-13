import { BLOCK_SIZE, CHUNK_WIDTH } from "./config.js";
import { blocksTextures, textures } from "./assets.js";

/**
 * @typedef {import("./world.js").default} World
 * @typedef {import("./chunk.js").default} Chunk
 */

/**
 * String representing the type of a Block.
 * @typedef {string} BlockType
 */
export const BlockType = {
  AIR: "air",
  DIRT: "dirt",
  GRASS: "grass",
  WOOD: "wood",
  LEAVES: "leaves",
};

/**
 * Base class of a Block object. Should not be instatiated directly. Use children block classes instead.
 */
export class Block {
  /**
   * @constructor
   * @param {World} world
   * @param {number} columnHeight
   * @param {Chunk} chunk
   * @param {number} localXIndex
   * @param {number} yIndex
   * @param {BlockType} type
   * @param {boolean} [isBackground=false]
   */
  constructor(
    world,
    columnHeight,
    chunk,
    localXIndex,
    yIndex,
    type,
    isBackground,
  ) {
    /**
     * The World that this Block is in.
     * @type {World}
     */
    this.world = world;

    /**
     * The terrain generation height at this Block's x position.
     * @type {number}
     */
    this.columnHeight = columnHeight;

    /**
     * The chunk that this block is in.
     * @type {Chunk}
     */
    this.chunk = chunk;
    /**
     * The x index of the Chunk that this Block is in.
     * @type {number}
     */
    this.chunkXIndex = this.chunk.xIndex;

    /**
     * The amount of time it takes to break this Block, in seconds.
     * @type {number}
     */
    this.breakTime = 1;

    /**
     * The x index of this block relative to the chunk that it is in.
     * @type {number}
     */
    this.localXIndex = localXIndex;
    /**
     * The global x index of this block relative to the world.
     * @type {number}
     */
    this.xIndex = this.chunkXIndex * CHUNK_WIDTH + this.localXIndex;
    /**
     * The y index of this block. Increases the lower it is on the screen.
     * @type {number}
     */
    this.yIndex = yIndex;

    /**
     * The x pixel position of this block when displayed on the screen.
     * @type {number}
     */
    this.screenX = this.xIndex * BLOCK_SIZE;
    /**
     * The y pixel position of this block when displayed on the screen.
     * @type {number}
     */
    this.screenY = this.yIndex * BLOCK_SIZE;

    /**
     * The type of this Block. Defaults to AIR.
     * @type {BlockType}
     */
    this.type = type || BlockType.AIR;

    /**
     * The light level from 0 being no light and 1 being completely lit up.
     * @type {number}
     */
    this.lightLevel = 0;
    /**
     * How much the light level gets reduced as a light ray passes throught the block.
     * @type {number}
     */
    this.opacity = 0;

    /**
     * Whether or not the Block is a background Block (has no collision, does not
     *   create shadows but does get affected by light).
     * @type {boolean}
     */
    this.isBackground = isBackground | false;
  }

  /**
   * Draws the block texture and its shadow if applicable.
   */
  draw(p5) {
    if (this.type !== BlockType.AIR && this.lightLevel > 0.01)
      p5.image(blocksTextures[this.type], this.screenX, this.screenY);

    if (this.lightLevel < 0.999) {
      p5.fill(
        0,
        0,
        0,
        255 * (1 - this.lightLevel * (this.isBackground ? 0.9 : 1)),
      );
      p5.rect(this.screenX, this.screenY, BLOCK_SIZE, BLOCK_SIZE);
    }
  }

  /**
   * Draws the block's highlight for when the crosshair is over it.
   */
  drawHighlight(p5) {
    p5.stroke(0);
    p5.strokeWeight(2);
    p5.noFill();
    p5.square(this.screenX, this.screenY, BLOCK_SIZE);
  }

  /**
   * Draws the cracks when breaking the block by the percentage.
   * @param {number} percent - the percentage of block breaking.
   */
  drawCracks(p5, percent) {
    p5.tint(255, 230);
    p5.image(
      textures.cracks[Math.floor(percent * textures.cracks.length)],
      this.screenX,
      this.screenY,
    );
    p5.noTint();
  }

  /**
   * Draws all debug information of this block.
   */
  drawDebug(p5) {
    p5.stroke(0);
    p5.fill(255);
    p5.text(
      `${this.type} (${this.xIndex},${this.yIndex}) Light: ${this.lightLevel}`,
      this.screenX,
      this.screenY - 10,
    );
    p5.stroke(255, 0, 0);
    p5.noFill();
    p5.square(this.screenX, this.screenY, BLOCK_SIZE);
    p5.noStroke();
  }

  /**
   * Gets all the defined blocks (including Air) around this Block in a 3x3 area.
   * @return {Block[]} the non-Undefined blocks around this Block.
   */
  getNeighbors() {
    return [
      this.world.getBlockAtBlockIndex(this.xIndex - 1, this.yIndex - 1),
      this.world.getBlockAtBlockIndex(this.xIndex - 1, this.yIndex),
      this.world.getBlockAtBlockIndex(this.xIndex - 1, this.yIndex + 1),
      this.world.getBlockAtBlockIndex(this.xIndex, this.yIndex - 1),
      this.world.getBlockAtBlockIndex(this.xIndex, this.yIndex + 1),
      this.world.getBlockAtBlockIndex(this.xIndex + 1, this.yIndex - 1),
      this.world.getBlockAtBlockIndex(this.xIndex + 1, this.yIndex),
      this.world.getBlockAtBlockIndex(this.xIndex + 1, this.yIndex + 1),
    ].filter((x) => x);
  }

  /**
   * Replaces this block with a new block.
   */
  replace(blockClass, isBackground) {
    this.chunk.setBlock(
      this.localXIndex,
      this.yIndex,
      blockClass,
      isBackground,
    );
  }

  /**
   * Determines if the block is able to be highlighted.
   * @param {Block} block
   * @return {boolean} whether or not the block is defined and is not Air.
   */
  static canHighlight(block) {
    return block && block.type !== BlockType.AIR;
  }

  /**
   * Determines if the block can be broken.
   * @param {Block} block
   * @return {boolean} whether or not the block is defined, is not Air, and has a
   *   positive breaking time.
   */
  static canBreak(block) {
    return block && block.type !== BlockType.AIR && block.breakTime > 0;
  }

  /**
   * Determines if the block has collision and return the block if so.
   * @param {Block} block
   * @return {Block?} the block or null.
   */
  static hasCollision(block) {
    return block && !block.isBackground && block.type !== BlockType.AIR
      ? block
      : null;
  }
}

export const blocks = {
  AirBlock: class extends Block {
    constructor(
      world,
      columnHeight,
      chunkXIndex,
      localXIndex,
      yIndex,
      isBackground,
    ) {
      super(
        world,
        columnHeight,
        chunkXIndex,
        localXIndex,
        yIndex,
        BlockType.AIR,
      );
      this.opacity = 0;
    }
  },

  DirtBlock: class extends Block {
    constructor(world, columnHeight, chunk, localXIndex, yIndex, isBackground) {
      super(
        world,
        columnHeight,
        chunk,
        localXIndex,
        yIndex,
        BlockType.DIRT,
        isBackground,
      );
      this.opacity = 1;
      this.breakTime = 0.75;
    }
  },

  GrassBlock: class extends Block {
    constructor(world, columnHeight, chunk, localXIndex, yIndex, isBackground) {
      super(
        world,
        columnHeight,
        chunk,
        localXIndex,
        yIndex,
        BlockType.GRASS,
        isBackground,
      );
      this.opacity = 1;
      this.breakTime = 0.9;
    }
  },

  WoodBlock: class extends Block {
    constructor(world, columnHeight, chunk, localXIndex, yIndex, isBackground) {
      super(
        world,
        columnHeight,
        chunk,
        localXIndex,
        yIndex,
        BlockType.WOOD,
        isBackground,
      );
      this.opacity = 1;
      this.breakTime = 3;
    }
  },

  LeavesBlock: class extends Block {
    constructor(world, columnHeight, chunk, localXIndex, yIndex, isBackground) {
      super(
        world,
        columnHeight,
        chunk,
        localXIndex,
        yIndex,
        BlockType.LEAVES,
        isBackground,
      );
      this.opacity = 0.05;
      this.breakTime = 0.3;
    }
  },
};
