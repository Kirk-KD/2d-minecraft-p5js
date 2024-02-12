import Chunk from "./chunk.js";
import { PerlinGeneration } from "./generation.js";
import { BLOCK_SIZE, CHUNK_WIDTH, WIDTH } from "./config.js";

class ChunksCollection {
  constructor(world) {
    this.world = world;
    this.positiveX = [];
    this.negativeX = [];
  }

  getAtXIndex(xIndex) {
    return this.#getCollection(xIndex)[this.#getIndex(xIndex)];
  }

  setAtXIndex(xIndex, chunk) {
    this.#getCollection(xIndex)[this.#getIndex(xIndex)] = chunk;
  }

  newChunkAtXIndex(xIndex, isSpawnChunk) {
    const chunk = new Chunk(this.world, xIndex);
    this.#getCollection(xIndex)[this.#getIndex(xIndex)] = chunk;

    if (!isSpawnChunk) chunk.generateTrees();
  }

  forEach(predicate) {
    for (let i = this.negativeX.length - 1; i >= 0; i--)
      predicate(this.negativeX[i]);
    this.positiveX.forEach(predicate);
  }

  #getIndex(xIndex) {
    return xIndex < 0 ? xIndex * -1 - 1 : xIndex;
  }

  #getCollection(xIndex) {
    return xIndex < 0 ? this.negativeX : this.positiveX;
  }
}

export default class World {
  constructor(p5, lighting) {
    this.lighting = lighting;
    this.terrainGenerator = new PerlinGeneration(p5);
    this.chunks = new ChunksCollection(this);

    for (let i = -2; i <= 2; i++) this.chunks.newChunkAtXIndex(i, true);
    for (let i = -2; i <= 2; i++) this.chunks.getAtXIndex(i).generateTrees();
  }

  draw(p5, camera) {
    this.chunks.forEach((chunk) => {
      chunk.draw(p5, camera);
    });
  }

  drawDebugBlock(p5, camera) {
    const block = this.getBlockAtBlockIndex(...camera.getBlockIndexAtMouse(p5));
    if (block) block.drawDebug(p5);
  }

  generateChunks(player) {
    const [min, max] = this.getChunkGenerationRange(player.x);
    for (let i = min; i < max; i++) {
      if (this.chunks.getAtXIndex(i) === undefined) {
        this.chunks.newChunkAtXIndex(i);
      }
    }
  }

  getChunkGenerationRange(xPosition) {
    const idx = this.xBlockIndexToChunkIndex(xPosition);
    return [
      idx - Math.ceil(WIDTH / BLOCK_SIZE / CHUNK_WIDTH),
      idx + Math.ceil(WIDTH / BLOCK_SIZE / CHUNK_WIDTH) + 1,
    ];
  }

  xPositionToChunkIndex(xPosition) {
    return Math.floor(xPosition / BLOCK_SIZE / CHUNK_WIDTH);
  }

  xBlockIndexToChunkIndex(xBlockIndex) {
    return Math.floor(xBlockIndex / CHUNK_WIDTH);
  }

  getBlockAtBlockIndex(x, y) {
    let i = Math.floor(x) % CHUNK_WIDTH;
    i = Math.abs(i < 0 ? CHUNK_WIDTH - Math.abs(i) : i);
    const chunk = this.chunks.getAtXIndex(this.xBlockIndexToChunkIndex(x));
    if (chunk) return chunk.blocks[i][Math.floor(y)];
  }
}
