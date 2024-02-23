import {
  PLAYER_MOVE_SPEED,
  BLOCK_SIZE,
  PLAYER_SPRINT_MULT,
  PLAYER_JUMP_SPRINT_MULT,
} from "./config.js";
import { Block, blocks } from "./block.js";
import { PlayerInventory } from "./inventory/inventory.js";
import { items } from "./inventory/item.js";

export default class Player {
  constructor(p5, world, width, height) {
    this.p5 = p5;
    this.world = world;
    this.width = width;
    this.height = height;
    this.x = 0;
    this.y = 0;
    this.yVel = 0;
    this.xVel = 0;

    this.breakingBlock = null;
    this.breakingBlockAmount = 0;

    this.isFalling = true;
    this.isJumping = false;

    this.inventory = new PlayerInventory(this);
    this.isViewingInventory = false;
  }

  breakBlock(block, deltaTime) {
    if (this.breakingBlock !== block) {
      this.breakingBlock = block;
      this.breakingBlockAmount = 0;
    }
    this.breakingBlockAmount += deltaTime;
    if (this.breakingBlockAmount >= this.breakingBlock.breakTime) {
      this.#onBlockBroken();
    } else
      this.breakingBlock.drawCracks(
        this.p5,
        this.breakingBlockAmount / this.breakingBlock.breakTime,
      );
  }

  placeBlock(block, blockClass) {
    block.replace(blockClass);
    this.getHeldItemStack().amount--;
    if (this.getHeldItemStack().amount === 0) this.setHeldItemStack(null);
  }

  setHeldItemStack(itemStack) {
    this.inventory.setSelectedSlot(itemStack);
  }

  getHeldItemStack() {
    return this.inventory.getSelectedSlot();
  }

  #onBlockBroken() {
    const drops = this.breakingBlock.getDrops();
    drops.forEach((stack) => {
      if (stack.amount < 1) return;
      this.inventory.addItem({ itemStack: stack });
    });

    this.breakingBlockAmount = 0;
    this.breakingBlock.replace(blocks.AirBlock);
    this.breakingBlock = null;
  }

  physics(deltaTime, xMoveDirection, jump, sprint) {
    // going up, check for top collision
    if (this.yVel < 0) {
      this.isJumping = true;

      const topCollision = this.#willCollideTop(deltaTime);
      if (topCollision) this.#stopJump(topCollision);
    }

    this.#gravity(deltaTime);
    this.#xMovement(deltaTime, xMoveDirection, this.isJumping, sprint);

    if (jump) this.#jump();

    this.#updatePositionByVelocity(deltaTime);

    this.world.generateChunks(this);
  }

  #gravity(deltaTime) {
    this.yVel += 60 * deltaTime;
    const bottomCollision = this.#willCollideBottom(deltaTime);
    if (bottomCollision) {
      this.#stopGravity(bottomCollision);
      this.isJumping = false;
    } else this.isFalling = true;
  }

  #stopGravity(bottomCollision) {
    this.yVel = 0;
    this.y = bottomCollision.yIndex - 0.001;
    this.isFalling = false;
  }

  #xMovement(deltaTime, direction, isJumping, isSprinting) {
    this.xVel =
      direction *
      PLAYER_MOVE_SPEED *
      (isSprinting ? PLAYER_SPRINT_MULT : 1) *
      (isJumping ? PLAYER_JUMP_SPRINT_MULT : 1);

    if (direction == 0) return;

    const xCollision = this.#willCollideX(direction, deltaTime);
    if (xCollision) this.#stopXMovement(xCollision, direction);
  }

  #stopXMovement(xCollision, direction) {
    this.xVel = 0;
    this.x =
      direction > 0
        ? xCollision.xIndex - 0.001 - this.width * 0.5 // right
        : xCollision.xIndex + 1 + 0.001 + this.width * 0.5; // left
  }

  #jump() {
    if (this.isFalling) return;

    this.yVel = -12;
  }

  #stopJump(topCollision) {
    this.yVel = 0;
    this.y = topCollision.yIndex + 1 + this.height + 0.001;
  }

  #updatePositionByVelocity(deltaTime) {
    this.x += this.xVel * deltaTime;
    this.y += this.yVel * deltaTime;
  }

  #willCollideX(dir, deltaTime) {
    return (
      Block.hasCollision(
        this.world.getBlockAtBlockIndex(
          this.x + dir * 0.5 * this.width + this.xVel * deltaTime,
          this.y,
        ),
      ) ||
      Block.hasCollision(
        this.world.getBlockAtBlockIndex(
          this.x + dir * 0.5 * this.width + this.xVel * deltaTime,
          this.y - this.height * 0.5,
        ),
      ) ||
      Block.hasCollision(
        this.world.getBlockAtBlockIndex(
          this.x + dir * 0.5 * this.width + this.xVel * deltaTime,
          this.y - this.height,
        ),
      )
    );
  }

  #willCollideBottom(deltaTime) {
    return (
      Block.hasCollision(
        this.world.getBlockAtBlockIndex(
          this.x - this.width * 0.5,
          this.y + this.yVel * deltaTime,
        ),
      ) ||
      Block.hasCollision(
        this.world.getBlockAtBlockIndex(
          this.x + this.width * 0.5,
          this.y + this.yVel * deltaTime,
        ),
      )
    );
  }

  #willCollideTop(deltaTime) {
    return (
      Block.hasCollision(
        this.world.getBlockAtBlockIndex(
          this.x - this.width * 0.5,
          this.y - this.height + this.yVel * deltaTime,
        ),
      ) ||
      Block.hasCollision(
        this.world.getBlockAtBlockIndex(
          this.x + this.width * 0.5,
          this.y - this.height + this.yVel * deltaTime,
        ),
      )
    );
  }

  toggleInventoryGUI() {
    this.isViewingInventory = !this.isViewingInventory;
  }

  draw(p5) {
    p5.stroke(0, 0, 255);
    p5.rect(
      this.x * BLOCK_SIZE - BLOCK_SIZE * this.width * 0.5,
      this.y * BLOCK_SIZE - BLOCK_SIZE * this.height,
      BLOCK_SIZE * this.width,
      BLOCK_SIZE * this.height,
    );
    p5.noStroke();
  }

  drawActiveInventory(p5) {
    if (this.isViewingInventory) this.inventory.draw(p5);

    this.inventory.drawHotbar(p5);
  }

  getEyePosition() {
    return [this.x + this.width / 2, this.y - this.height - 0.2];
  }
}
