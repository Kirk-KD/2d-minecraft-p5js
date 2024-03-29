/// <reference path="../../p5.global-mode.d.ts" />

import {
  INVENTORY_SLOT_SIZE,
  INVENTORY_SLOT_ITEM_SIZE,
  INVENTORY_SLOT_NET_SIZE,
  INVENTORY_PADDING,
  INVENTORY_MARGIN,
  HOTBAR_BOTTOM,
  HOTBAR_SLOT_SIZE,
  HOTBAR_SLOT_ITEM_SIZE,
  CENTER_X,
  CENTER_Y,
  WIDTH,
  HEIGHT,
} from "../config.js";
import { ItemStack } from "./item.js";
import { fonts } from "../assets.js";
import { CraftingGrid, recipes } from "../crafting.js";

/**
 * @typedef {import("./item.js").Item} Item
 * @typedef {import("../player.js").default} Player
 */

/**
 * Base class for any types of inventory.
 */
export class Inventory {
  /**
   * @param {number} rows
   * @param {number} columns
   * @param {string} name
   */
  constructor(rows, columns, name) {
    /**
     * @type {number}
     */
    this.rows = rows;
    /**
     * @type {number}
     */
    this.columns = columns;
    /**
     * @type {string}
     */
    this.name = name || "Inventory";
    /**
     * @type {Array<Array<ItemStack?>>}
     */
    this.slots = new Array(this.rows)
      .fill(null)
      .map(() => new Array(this.columns).fill(null));

    this.slotPositions = new Array(this.rows)
      .fill(null)
      .map(() => new Array(this.columns).fill(null));
  }

  /**
   * Gets the slot at a specic row and column.
   * @param {number} row
   * @param {number} col
   * @return {ItemStack?}
   */
  getAt(row, col) {
    return this.slots[row][col];
  }

  /**
   * Adds a number of items or an ItemStack to this inventory. The placement of the new Items are
   * handled automatically.
   * @param {Object} args
   * @param {ItemStack?} [args.itemStack] The ItemStack to be added to this Inventory. Prioritises this argument.
   * @param {Item?} [args.item] The Item to be added. Must be used with the amount parameter.
   * @param {number?} [args.amount] The amount of the Item to be added. Mush be used with the item parameter.
   * @return {boolean} Whether or not there are items left over that did not fit in the Inventory.
   */
  addItem({ itemStack = null, item = null, amount = null }) {
    if (!itemStack) itemStack = new ItemStack(item, amount);

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const slot = this.getAt(row, col);

        if (slot && slot.item == itemStack.item) {
          if (slot.amount + itemStack.amount > ItemStack.MAX_STACK_SIZE) {
            itemStack.amount -= ItemStack.MAX_STACK_SIZE - slot.amount;
            slot.amount = ItemStack.MAX_STACK_SIZE;
          } else {
            slot.amount += itemStack.amount;
            return false;
          }
        }
      }
    }

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const slot = this.getAt(row, col);

        if (slot === null) {
          if (itemStack.amount > ItemStack.MAX_STACK_SIZE) {
            this.setItemStack(
              new ItemStack(itemStack.item, ItemStack.MAX_STACK_SIZE),
              row,
              col,
            );
            itemStack.amount -= ItemStack.MAX_STACK_SIZE;
          } else {
            this.setItemStack(itemStack, row, col);
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Draws this inventory where the top left slot is at x,y.
   * @param {p5} p5
   * @param {number} topLeftX
   * @param {number} topLeftY
   */
  draw(p5, topLeftX, topLeftY) {
    p5.imageMode(p5.CENTER);
    p5.textAlign(p5.RIGHT, p5.BOTTOM);
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++)
        this.drawSlot(
          p5,
          row,
          col,
          topLeftX + col * INVENTORY_SLOT_NET_SIZE,
          topLeftY + row * INVENTORY_SLOT_NET_SIZE,
        );
    }
  }

  /**
   * Draws the ItemStack at the given index, assuming rectMode is CENTER.
   * @param {p5} p5
   * @param {number} row
   * @param {number} col
   * @param {number} x
   * @param {number} y
   */
  drawSlot(p5, row, col, x, y) {
    this.drawSlotFlex(
      p5,
      row,
      col,
      x,
      y,
      INVENTORY_SLOT_SIZE,
      INVENTORY_SLOT_ITEM_SIZE,
      [70, 70, 70],
      [160, 160, 160],
      2,
      4,
      16,
    );
  }

  /**
   * Draws slot with more flexibility.
   */
  drawSlotFlex(
    p5,
    row,
    col,
    x,
    y,
    slotSize,
    itemSize,
    strokeColor,
    fillColor,
    strokeWeight,
    cornerRounding,
    textSize,
    isHotBar,
  ) {
    if (!isHotBar)
      this.slotPositions[row][col] = [x - slotSize / 2, y - slotSize / 2];

    p5.stroke(...strokeColor);
    p5.strokeWeight(strokeWeight);
    p5.fill(...fillColor);
    p5.rect(x, y, slotSize, slotSize, cornerRounding);

    const slot = this.getAt(row, col);
    if (!slot) return;

    p5.image(slot.item.texture, x, y, itemSize, itemSize);
    if (slot.amount > 1) {
      p5.textSize(textSize);
      p5.textFont(fonts.minecraft);
      p5.fill(255, 255, 255);
      p5.strokeWeight(3);
      p5.stroke(0, 0, 0);
      p5.text(
        slot.amount.toString(),
        x + slotSize / 2 - 2,
        y + slotSize / 2 - 2,
      );
    }
  }

  /**
   * Draws a freely placed slot.
   */
  drawSlotFree(p5, slot, x, y) {
    p5.imageMode(p5.CENTER);
    p5.textAlign(p5.RIGHT, p5.BOTTOM);

    p5.stroke(70, 70, 70);
    p5.strokeWeight(2);
    p5.fill(160, 160, 160);
    p5.rect(x, y, INVENTORY_SLOT_SIZE, INVENTORY_SLOT_SIZE, 4);

    if (!slot) return;

    p5.image(
      slot.item.texture,
      x,
      y,
      INVENTORY_SLOT_ITEM_SIZE,
      INVENTORY_SLOT_ITEM_SIZE,
    );
    if (slot.amount > 1) {
      p5.textSize(16);
      p5.textFont(fonts.minecraft);
      p5.fill(255, 255, 255);
      p5.strokeWeight(3);
      p5.stroke(0, 0, 0);
      p5.text(
        slot.amount.toString(),
        x + INVENTORY_SLOT_SIZE / 2 - 2,
        y + INVENTORY_SLOT_SIZE / 2 - 2,
      );
    }
  }

  /**
   * Sets the slot to an ItemStack.
   * @param {ItemStack?} itemStack
   * @param {number} row
   * @param {number} col
   */
  setItemStack(itemStack, row, col) {
    this.slots[row][col] = itemStack;
  }

  /**
   * Converts mouse location to slot index.
   * @param {number} x
   * @param {number} y
   * @return {[number, number]} the slot index.
   */
  mouseToSlotIndex(x, y) {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const [xx, yy] = this.slotPositions[row][col];
        if (
          x - xx >= 0 &&
          x - xx <= INVENTORY_SLOT_SIZE &&
          y - yy >= 0 &&
          y - yy <= INVENTORY_SLOT_SIZE
        )
          return [row, col];
      }
    }
    return null;
  }
}

/**
 * Base class for any crafting inventory.
 */
class CraftingInventory extends Inventory {
  /**
   * @param {number} size
   * @param {string} name
   */
  constructor(size, name) {
    super(size, size, name);
    this.craftResult = null;

    this.resultX = null;
    this.resultY = null;
  }

  draw(p5, topLeftX, topLeftY) {
    this.craftResult = recipes.getResult(this.getCraftingGrid());

    super.draw(p5, topLeftX, topLeftY);
    this.resultX = topLeftX + INVENTORY_SLOT_NET_SIZE * 3;
    this.resultY = topLeftY + INVENTORY_SLOT_NET_SIZE / 2;
    this.drawSlotFree(p5, this.craftResult, this.resultX, this.resultY);
  }

  isClickingOnResult(mouseX, mouseY) {
    return (
      Math.abs(mouseX - this.resultX) < INVENTORY_SLOT_SIZE / 2 &&
      Math.abs(mouseY - this.resultY) < INVENTORY_SLOT_SIZE / 2
    );
  }

  getCraftingGrid() {}
}

/**
 * Class for the 2x2 crafting area in the player's inventory.
 */
class QuickCraft extends CraftingInventory {
  constructor() {
    super(2, "Quick Craft");
  }

  getCraftingGrid() {
    return new CraftingGrid(
      this.slots
        .map((row) => {
          return row
            .map((slot) => {
              return slot ? slot.item : null;
            })
            .concat([null]);
        })
        .concat([[null, null, null]]),
    );
  }
}

/**
 * Object representing the Player's inventory.
 */
export class PlayerInventory extends Inventory {
  /**
   * @param {Player} player
   */
  constructor(player) {
    super(4, 9, "Player Inventory");

    /**
     * @type {Player}
     */
    this.player = player;
    /**
     * @type {number}
     */
    this.selectedHotbarSlot = 0;

    /**
     * @type {[ItemStack?, ItemStack?, ItemStack?, ItemStack?]}
     */
    this.armorSlots = [null, null, null, null];

    /**
     * @type {Inventory?}
     */
    this.viewingInventory = null;

    /**
     * @type {ItemStack?}
     */
    this.cursorHeldItemStack = null;

    this.quickCraft = new QuickCraft();
  }

  /**
   * Gets the item currently selected by the Player on the hotbar.
   */
  getSelectedSlot() {
    return this.getAt(0, this.selectedHotbarSlot);
  }

  /**
   * Sets the item held by the Player.
   * @param {ItemStack?} newItemStack
   */
  setSelectedSlot(newItemStack) {
    this.setItemStack(newItemStack, 0, this.selectedHotbarSlot);
  }

  /**
   * Scroll the hotbar selection in the specified direction.
   * @param {number} dir
   */
  scrollSelectedHotbarSlot(dir) {
    this.selectedHotbarSlot += dir;
    if (this.selectedHotbarSlot < 0) this.selectedHotbarSlot = this.columns - 1;
    else this.selectedHotbarSlot %= this.columns;
  }

  /**
   * Draws this inventory.
   * @param {p5} p5
   */
  draw(p5) {
    p5.push();

    p5.rectMode(p5.CENTER);
    p5.imageMode(p5.CENTER);
    p5.textAlign(p5.RIGHT, p5.BOTTOM);

    const invWidth =
      this.columns * INVENTORY_SLOT_SIZE +
      (this.columns - 1) * INVENTORY_PADDING +
      2 * INVENTORY_MARGIN;

    const playerInvHeight =
      this.rows * INVENTORY_SLOT_SIZE +
      (this.rows - 2) * INVENTORY_PADDING +
      INVENTORY_MARGIN;

    const topHeight = this.viewingInventory
      ? this.viewingInventory.rows * INVENTORY_SLOT_SIZE +
        (this.viewingInventory.rows - 1) * INVENTORY_PADDING +
        3 * INVENTORY_MARGIN
      : 3 * INVENTORY_MARGIN + 4 * INVENTORY_SLOT_SIZE + 3 * INVENTORY_PADDING;

    const invHeight = INVENTORY_MARGIN + playerInvHeight + topHeight;

    p5.stroke(235, 235, 235);
    p5.strokeWeight(2);
    p5.fill(227, 227, 227);
    p5.rect(CENTER_X, CENTER_Y, invWidth, invHeight, 5);

    const left = WIDTH / 2 - invWidth / 2;
    const top = HEIGHT / 2 - invHeight / 2;

    const invSlotTop =
      top +
      invHeight -
      playerInvHeight -
      INVENTORY_MARGIN +
      INVENTORY_SLOT_SIZE / 2;
    const invSlotLeft = left + INVENTORY_SLOT_SIZE / 2;

    for (let row = 1; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const x =
          INVENTORY_MARGIN + invSlotLeft + INVENTORY_SLOT_NET_SIZE * col;
        const y = invSlotTop + INVENTORY_SLOT_NET_SIZE * (row - 1);

        this.drawSlot(p5, row, col, x, y);
      }
    }

    const hotbarY =
      invSlotTop +
      INVENTORY_SLOT_SIZE * (this.rows - 1) +
      INVENTORY_PADDING * (this.rows - 2) +
      INVENTORY_MARGIN;
    for (let col = 0; col < this.columns; col++) {
      const x = INVENTORY_MARGIN + invSlotLeft + INVENTORY_SLOT_NET_SIZE * col;

      this.drawSlot(p5, 0, col, x, hotbarY);
    }

    if (this.viewingInventory) {
      this.viewingInventory.draw(
        p5,
        left + INVENTORY_MARGIN + INVENTORY_SLOT_SIZE / 2,
        top + INVENTORY_MARGIN * 2 + INVENTORY_SLOT_SIZE / 2,
      );
    }

    p5.textFont(fonts.minecraft);
    p5.textSize(18);
    p5.strokeWeight(1);
    p5.stroke(120, 120, 120);
    p5.fill(120, 120, 120);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text(
      this.viewingInventory ? this.viewingInventory.name : this.name,
      left + INVENTORY_MARGIN,
      top + 3,
    );

    if (!this.viewingInventory)
      this.quickCraft.draw(
        p5,
        left +
          invWidth -
          (this.quickCraft.columns + 2) * INVENTORY_SLOT_NET_SIZE -
          INVENTORY_MARGIN,
        top + INVENTORY_MARGIN + INVENTORY_SLOT_NET_SIZE,
      );

    this.#drawCursorHeldItemStack(p5, p5.mouseX, p5.mouseY);

    p5.pop();
  }

  /**
   * Draws the hotbar.
   * @param {p5} p5
   */
  drawHotbar(p5) {
    p5.push();

    p5.rectMode(p5.CENTER);
    p5.imageMode(p5.CENTER);
    p5.textAlign(p5.RIGHT, p5.BOTTOM);

    const y = HEIGHT - HOTBAR_BOTTOM - HOTBAR_SLOT_SIZE / 2;
    let x =
      CENTER_X - (this.columns / 2) * HOTBAR_SLOT_SIZE + HOTBAR_SLOT_SIZE / 2;

    for (let col = 0; col < this.columns; col++) {
      this.drawSlotFlex(
        p5,
        0,
        col,
        x + col * HOTBAR_SLOT_SIZE,
        y,
        HOTBAR_SLOT_SIZE,
        HOTBAR_SLOT_ITEM_SIZE,
        [70, 70, 70],
        [160, 160, 160, 150],
        2,
        0,
        18,
        true,
      );
    }

    p5.noFill();
    p5.stroke(255, 255, 255);
    p5.strokeWeight(3);
    p5.rect(
      x + this.selectedHotbarSlot * HOTBAR_SLOT_SIZE,
      y,
      HOTBAR_SLOT_SIZE + 2,
      HOTBAR_SLOT_SIZE + 2,
    );

    p5.pop();
  }

  /**
   * Draws the item currently held by the cursor.
   * @param {p5} p5
   * @param {number} mouseX
   * @param {number} mouseY
   */
  #drawCursorHeldItemStack(p5, mouseX, mouseY) {
    if (!this.cursorHeldItemStack) return;

    p5.imageMode(p5.CENTER);
    p5.textAlign(p5.RIGHT, p5.BOTTOM);

    p5.image(
      this.cursorHeldItemStack.item.texture,
      mouseX,
      mouseY,
      INVENTORY_SLOT_ITEM_SIZE,
      INVENTORY_SLOT_ITEM_SIZE,
    );
    if (this.cursorHeldItemStack.amount > 1) {
      p5.textSize(16);
      p5.textFont(fonts.minecraft);
      p5.fill(255, 255, 255);
      p5.strokeWeight(3);
      p5.stroke(0, 0, 0);
      p5.text(
        this.cursorHeldItemStack.amount.toString(),
        mouseX + INVENTORY_SLOT_SIZE / 2 - 2,
        mouseY + INVENTORY_SLOT_SIZE / 2 - 2,
      );
    }
  }

  /**
   * Called when the left mouse button is clicked in the Inventory.
   */
  onLeftClick(mouseX, mouseY) {
    let slotIndex = this.mouseToSlotIndex(mouseX, mouseY);
    let slot, inventory;
    if (!slotIndex) {
      if (this.viewingInventory) {
        slotIndex = this.viewingInventory.mouseToSlotIndex(mouseX, mouseY);
        if (!slotIndex) return;
        inventory = this.viewingInventory;
      } else {
        slotIndex = this.quickCraft.mouseToSlotIndex(mouseX, mouseY);
        if (slotIndex) inventory = this.quickCraft;
        else if (this.quickCraft.isClickingOnResult(mouseX, mouseY)) {
          if (this.cursorHeldItemStack)
            this.addItem({ itemStack: this.cursorHeldItemStack });
          this.cursorHeldItemStack = this.quickCraft.craftResult;

          if (this.quickCraft.craftResult) {
            this.quickCraft.slots.forEach((row, i) => {
              row.forEach((slot, j) => {
                if (slot && !--slot.amount) this.quickCraft.slots[i][j] = null;
              });
            });
          }

          this.quickCraft.craftResult = null;
          return;
        } else return;
      }
    } else if (slotIndex) inventory = this;

    if (!inventory) return;

    slot = inventory.getAt(...slotIndex);

    if (this.cursorHeldItemStack) {
      if (slot) {
        if (slot.item === this.cursorHeldItemStack.item) {
          if (
            slot.amount + this.cursorHeldItemStack.amount >
            ItemStack.MAX_STACK_SIZE
          ) {
            this.cursorHeldItemStack.amount -=
              ItemStack.MAX_STACK_SIZE - slot.amount;
            slot.amount = ItemStack.MAX_STACK_SIZE;
          } else {
            slot.amount += this.cursorHeldItemStack.amount;
            this.cursorHeldItemStack = null;
          }
        } else {
          let temp = this.cursorHeldItemStack.copy();
          this.cursorHeldItemStack = slot.copy();
          inventory.setItemStack(temp, ...slotIndex);
        }
      } else {
        inventory.setItemStack(this.cursorHeldItemStack, ...slotIndex);
        this.cursorHeldItemStack = null;
      }
    } else {
      if (!slot) return;

      this.cursorHeldItemStack = slot.copy();
      inventory.setItemStack(null, ...slotIndex);
    }
  }

  /**
   * Called when the left mouse buttom is clicked in the Inventory.
   */
  onRightClick(mouseX, mouseY) {
    let slotIndex = this.mouseToSlotIndex(mouseX, mouseY);
    let slot, inventory;
    if (!slotIndex) {
      if (this.viewingInventory) {
        slotIndex = this.viewingInventory.mouseToSlotIndex(mouseX, mouseY);
        if (!slotIndex) return;
        inventory = this.viewingInventory;
      } else {
        slotIndex = this.quickCraft.mouseToSlotIndex(mouseX, mouseY);
        if (slotIndex) inventory = this.quickCraft;
        else return;
      }
    } else if (slotIndex) inventory = this;

    if (!inventory) return;

    slot = inventory.getAt(...slotIndex);

    if (this.cursorHeldItemStack) {
      if (!slot) {
        this.cursorHeldItemStack.amount--;
        inventory.setItemStack(
          new ItemStack(this.cursorHeldItemStack.item, 1),
          ...slotIndex,
        );
      } else if (slot.item === this.cursorHeldItemStack.item) {
        this.cursorHeldItemStack.amount--;
        slot.amount++;
      }

      if (this.cursorHeldItemStack.amount === 0)
        this.cursorHeldItemStack = null;
    }
  }
}
