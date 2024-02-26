import Chunk from "./chunk.js";
import { PerlinGeneration } from "./generation.js";
import { BLOCK_SIZE, CHUNK_WIDTH, WIDTH } from "./config.js";
import LightingCalculation from "./lighting.js";
import Camera from "./camera.js";
import Player from "./player.js";
import { Block } from "./block.js";

/**
 * An object for storing all the Chunks of a world that handles the
 * creation of new chunks. Chunks are stored seperately in the positive
 * and negative X directions.
 */
class ChunksCollection {
  /**
   * @constructor
   * @param {World} world
   */
  constructor(world) {
    /**
     * The world that this ChunksCollection is part of.
     * @type {World}
     */
    this.world = world;
    /**
     * The array for storing chunks in the positive direction.
     * @type {Chunk[]}
     */
    this.positiveX = [];
    /**
     * The array for storing chunks in the negative direction.
     * @type {Chunk[]}
     */
    this.negativeX = [];
  }

  /**
   * Get the Chunk at an index, either positive or negative.
   * @param {number} xIndex
   * @return {Chunk | undefined} The chunk at the index or undefined.
   */
  getAtXIndex(xIndex) {
    return this.#getCollection(xIndex)[this.#getIndex(xIndex)];
  }

  /**
   * Set a chunk at an index, either positive or negative.
   * @param {number} xIndex
   * @param {Chunk} chunk
   */
  setAtXIndex(xIndex, chunk) {
    this.#getCollection(xIndex)[this.#getIndex(xIndex)] = chunk;
  }

  /**
   * Creates a new chunk at the x index. If it is not a spawn
   *   chunk, create trees right after creating the chunk.
   * @param {number} xIndex
   * @param {boolean} [isSpawnChunk]
   */
  newChunkAtXIndex(xIndex, isSpawnChunk) {
    const chunk = new Chunk(this.world, xIndex);
    this.#getCollection(xIndex)[this.#getIndex(xIndex)] = chunk;

    if (!isSpawnChunk) chunk.generateTrees();
  }

  /**
   * Loops through each chunk in both the positive and negative collections.
   *   Order is from left to right (increasing x position) for both collections.
   * @param {(value: Chunk) => void} callback
   */
  forEach(callback) {
    for (let i = this.negativeX.length - 1; i >= 0; i--)
      callback(this.negativeX[i]);
    this.positiveX.forEach(callback);
  }

  /**
   * Gets the index converted for negative chunks if needed.
   * @param {number} xIndex
   * @return {number} The converted index.
   */
  #getIndex(xIndex) {
    return xIndex < 0 ? xIndex * -1 - 1 : xIndex;
  }

  /**
   * Gets the appropriate array based on whether the index is postive or negative.
   * @param {number} xIndex
   * @return {Chunk[]} The appropriate array of chunks.
   */
  #getCollection(xIndex) {
    return xIndex < 0 ? this.negativeX : this.positiveX;
  }
}

/**
 * The representation of the World. Contains the lighting calculation object,
 * terrain generation, and stores all the chunks. Upon instantiation, the
 * World object creates five chunks in index range [-2, 2], the individually
 * places trees only after the base blocks are placed by the terrian generator.
 */
export default class World {
  /**
   * @constructor
   * @param {LightingCalculation} lighting
   */
  constructor(p5, lighting) {
    /**
     * The lighing calculation object.
     * @type {LightingCalculation}
     */
    this.lighting = lighting;
    /**
     * The terrain generation object.
     * @type {PerlinGeneration}
     */
    this.terrainGenerator = new PerlinGeneration(p5);
    /**
     * The collection of Chunks.
     * @type {ChunksCollection}
     */
    this.chunks = new ChunksCollection(this);

    for (let i = -2; i <= 2; i++) this.chunks.newChunkAtXIndex(i, true);
    for (let i = -2; i <= 2; i++) this.chunks.getAtXIndex(i).generateTrees();
  }

  /**
   * Draws everything in this World.
   * @param {Camera} camera
   */
  draw(p5, camera) {
    this.chunks.forEach((chunk) => {
      chunk.draw(p5, camera);
    });
  }

  /**
   * Draws the debug view of the Block at the mouse cursor.
   * @param {Camera} camera
   */
  drawDebugBlock(p5, camera) {
    const block = this.getBlockAtBlockIndex(...camera.getBlockIndexAtMouse(p5));
    if (block) block.drawDebug(p5);
  }

  /**
   * Generates new Chunks near the Player, if neccessary.
   * @param {Player} player
   */
  generateChunks(player) {
    const [min, max] = this.getChunkGenerationRange(player.x);
    for (let i = min; i < max; i++) {
      if (this.chunks.getAtXIndex(i) === undefined) {
        this.chunks.newChunkAtXIndex(i);
      }
    }
  }

  /**
   * Gets the range of indexes of Chunks to be generated as needed.
   * @param {number} xPosition
   * @return {[number, number]} the start index (inclusive) and the stop index (exclusive) of range of indexes.
   */
  getChunkGenerationRange(xPosition) {
    const idx = this.xBlockIndexToChunkIndex(xPosition);
    return [
      idx - Math.ceil(WIDTH / BLOCK_SIZE / CHUNK_WIDTH),
      idx + Math.ceil(WIDTH / BLOCK_SIZE / CHUNK_WIDTH) + 1,
    ];
  }

  /**
   * Converts an x position to the chunk's index that the position is in.
   * @param {number} xPosition
   * @return {number} The chunk's index.
   */
  xPositionToChunkIndex(xPosition) {
    return Math.floor(xPosition / BLOCK_SIZE / CHUNK_WIDTH);
  }

  /**
   * Converts a block index to chunk index that it's in.
   * @param {number} xBlockIndex
   * @return {number} The chunk's index.
   */
  xBlockIndexToChunkIndex(xBlockIndex) {
    return Math.floor(xBlockIndex / CHUNK_WIDTH);
  }

  /**
   * Gets a block at a specific index at x and y.
   * @param {number} x
   * @param {number} y
   * @return {Block?}
   */
  getBlockAtBlockIndex(x, y) {
    let i = Math.floor(x) % CHUNK_WIDTH;
    i = Math.abs(i < 0 ? CHUNK_WIDTH - Math.abs(i) : i);
    const chunk = this.chunks.getAtXIndex(this.xBlockIndexToChunkIndex(x));
    return chunk ? chunk.blocks[i][Math.floor(y)] : null;
  }
}
