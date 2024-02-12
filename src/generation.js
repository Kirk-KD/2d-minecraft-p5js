import { BlockType } from "./block.js";

export class PerlinGeneration {
  constructor(p5, seed) {
    this.p5 = p5;
    this.seed = seed || Math.random() * 9999999999999;

    this.p5.noiseSeed(this.seed);
  }

  getHeight(x) {
    return Math.round(70 + this.p5.noise((this.seed + x) * 0.1) * 15);
  }

  getTree(x) {
    return this.p5.noise((this.seed * Math.PI + x) * 0.1);
  }
}

class TreeStructure {
  constructor(representation, blockMapping, centerX) {
    this.representation = representation;
    this.blockMapping = blockMapping;
    this.centerX = centerX;

    this.structure = [];
    for (let y = 0; y < this.representation.length; y++) {
      this.structure.push([]);
      for (let x = 0; x < this.representation[y].length; x++) {
        this.structure[y].push(
          this.blockMapping[this.representation[y].charAt(x)],
        );
      }
    }
  }

  place(chunk, baseLocalX, baseY) {
    for (let y = 0; y < this.structure.length; y++) {
      const offsetY = this.structure.length - y - 1;
      for (let x = 0; x < this.structure[y].length; x++) {
        if (!this.structure[y][x]) continue;
        
        const offsetX = this.centerX - x;
        chunk.setBlock(
          baseLocalX - offsetX,
          baseY - offsetY,
          this.structure[y][x]
        );
      }
    }
  }
}

export const TREE_STRUCTURES = {
  oak: [
    new TreeStructure([
      " ### ",
      "#####",
      "##H##",
      "  H  ",
      "  H  "
    ], {
      "#": BlockType.LEAVES,
      "H": BlockType.WOOD
    }, 2),
    new TreeStructure([
      " ##### ",
      " ##### ",
      "###H###",
      "###H###",
      "   H   ",
      "   H   ",
      "   H   "
    ], {
      "#": BlockType.LEAVES,
      "H": BlockType.WOOD
    }, 2),
    new TreeStructure([
      " ##### ",
      "#######",
      "###H###",
      " ##H## ",
      "   H   ",
      "   H   ",
      "   H   "
    ], {
      "#": BlockType.LEAVES,
      "H": BlockType.WOOD
    }, 2)
  ],
};