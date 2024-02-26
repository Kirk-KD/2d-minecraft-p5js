import { Block, BlockType } from "./block.js";
import Utils from "./utils.js";
import {
  CHUNK_WIDTH,
  HEIGHT,
  MAX_HEIGHT,
  BLOCK_SIZE,
  MAX_SKY_LIGHT,
  MIN_SKY_LIGHT,
  WIDTH,
} from "./config.js";

/** @typedef {import("./world.js").default} World */
/** @typedef {import("./player.js").default} Player */

export default class LightingCalculation {
  /**
   * @param {World} world
   * @param {Player} player
   */
  constructor(world, player) {
    /** @type {World} */
    this.world = world;
    /** @type {Player} */
    this.player = player;

    /** @type {number} */
    this.skyLightLevel = MAX_SKY_LIGHT;
  }

  /**
   * Update the light levels.
   */
  updateLightLevels() {
    // this.#updateLightLevelsInRange(
    //   Math.floor(this.player.x - Math.ceil(WIDTH / 2 / BLOCK_SIZE)),
    //   Math.ceil(this.player.x + Math.ceil(WIDTH / 2 / BLOCK_SIZE)),
    // );
    const [chunkStart, chunkEnd] = this.world.getChunkGenerationRange(this.player.x);
    this.#updateLightLevelsInRange(
      chunkStart * CHUNK_WIDTH,
      (chunkEnd - 1) * CHUNK_WIDTH
    );
  }

  /**
   * Update the light levels in the x index range given.
   * @param {number} xStart
   * @param {number} xEnd
   */
  #updateLightLevelsInRange(xStart, xEnd) {
    let missedBlocks = [];

    const h = Math.ceil(HEIGHT / BLOCK_SIZE);
    const yStart = Math.max(0, (Math.floor(this.player.y / h) - 1) * h);
    const yEnd = Math.min(MAX_HEIGHT, (Math.floor(this.player.y / h) + 2) * h);
    
    for (let x = xStart; x <= xEnd; x++) {
      let lightLevel = this.skyLightLevel;
      let prevBlockIsBg = false;

      let stopped = false;

      for (let y = yStart; y < yEnd; y++) {
        const block = this.world.getBlockAtBlockIndex(x, y);
        block.lightLevel = 0;

        if (stopped) {
          missedBlocks.push(block);
          continue;
        }

        block.lightLevel = lightLevel;

        if (block.type === BlockType.AIR) continue;
        else if (block.isBackground) {
          if (!prevBlockIsBg) lightLevel -= block.opacity;
        } else lightLevel -= block.opacity;

        prevBlockIsBg = block.isBackground;

        if (lightLevel <= 0) stopped = true;
      }
    }

    if (missedBlocks.length) this.#smoothLighting(missedBlocks);
  }

  /**
   * @param {Block[]} missedBlocks
   */
  #smoothLighting(missedBlocks) {
    const checked = [];
    for (let iter = 0; iter < 6; iter++) {
      const checkedIter = [];
      
      missedBlocks.forEach(block => {
        if (checked.includes(block)) return;

        const neighbors = block.getNeighbors();
        let validCounter = 0;
        neighbors.forEach(neighbor => {
          if (!missedBlocks.includes(neighbor) || checked.includes(neighbor)) {
            if (!checkedIter.includes(block)) checkedIter.push(block);
            block.lightLevel += this.#diffuseLightFactor(block, neighbor) * neighbor.lightLevel;
            validCounter++;
          }
        });
        if (validCounter)
          block.lightLevel /= validCounter;
      });
      
      checked.push(...checkedIter);
    }
  }

  #diffuseLightFactor(recipient, neighbor) {
    return (
      (neighbor.type === BlockType.AIR ? 0.9 : 0.6) -
      (recipient.xIndex !== neighbor.xIndex &&
      recipient.yIndex !== neighbor.yIndex
        ? 0.41
        : 0)
    );
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
