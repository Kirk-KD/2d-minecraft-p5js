/// <reference path="../../p5.global-mode.d.ts" />

import { blocksTextures, itemsTextures } from "../assets.js";
import { BlockType, blocks } from "../block.js";

/**
 * Base class for an Item.
 */
export class Item {
  /**
   * @param {string} id
   * @param {p5.Image} [texture]
   */
  constructor(id, texture) {
    /**
     * @type {string}
     */
    this.id = id;
    /**
     * @type {p5.Image}
     */
    this.texture = texture || itemsTextures[this.id];
  }
}

/**
 * An object representing a placeable block item.
 */
export class BlockItem extends Item {
  /**
   * @param {string} id
   * @param {BlockType} type
   * @param {any} blockClass
   */
  constructor(id, type, blockClass) {
    super(id, blocksTextures[type]);

    /**
     * @type {BlockType}
     */
    this.blockType = type;
    /**
     * @type {any}
     */
    this.blockClass = blockClass;
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

  /**
   * Makes a copy of this ItemStack.
   * @return {ItemStack}
   */
  copy() {
    return new ItemStack(this.item, this.amount);
  }
}

/**
 * @type {Object<string, Item>}
 */
export let items;

export function loadItems() {
  items = {
    Dirt: new BlockItem("dirt", BlockType.DIRT, blocks.DirtBlock),
    Wood: new BlockItem("wood", BlockType.WOOD, blocks.WoodBlock),
    Plank: new BlockItem("plank", BlockType.PLANK, blocks.PlankBlock),

    Stick: new Item("stick"),
  };
}
