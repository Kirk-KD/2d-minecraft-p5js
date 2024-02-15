/// <reference path="../../p5.global-mode.d.ts" />

import { blocksTextures } from "../assets.js";
import { BlockType } from "../block.js";

/**
 * Base class for an Item.
 */
export class Item {
  /**
   * @param {string} id
   * @param {p5.Image} texture
   */
  constructor(id, texture) {
    /**
     * @type {string}
     */
    this.id = id;
    /**
     * @type {p5.Image}
     */
    this.texture = texture;
  }
}

/**
 * An object representing a placeable block item.
 */
export class BlockItem extends Item {
  /**
   * @param {string} id
   * @param {BlockType} type
   */
  constructor(id, type) {
    super(id, blocksTextures[type]);

    /**
     * @type {BlockType}
     */
    this.blockType = type;
  }
}

/**
 * An object containing an item and the amount of that item.
 */
export class ItemStack {
  static MAX_STACK_SIZE = 64;

  /**
   * @param {Item} item
   * @param {number} amount
   */
  constructor(item, amount) {
    /**
     * @type {Item}
     */
    this.item = item;
    /**
     * @type {number}
     */
    this.amount = amount;
  }
}

/**
 * @type {Object<string, BlockItem>}
 */
export let items;

export function loadItems() {
  items = {
    Dirt: new BlockItem("dirt", BlockType.DIRT),
    Wood: new BlockItem("wood", BlockType.WOOD),
  };
}
