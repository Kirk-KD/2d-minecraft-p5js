import { PLAYER_MOVE_SPEED, BLOCK_SIZE } from "./config.js";
import { Block, BlockType } from "./block.js";

export default class Player {
  constructor(world, width, height) {
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
  }

  breakBlock(block, deltaTime) {
    if (this.breakingBlock !== block) {
      this.breakingBlock = block;
      this.breakingBlockAmount = 0;
    }
    this.breakingBlockAmount += deltaTime;
    if (this.breakingBlockAmount >= this.breakingBlock.breakTime) {
      this.breakingBlockAmount = 0;
      this.breakingBlock.type = BlockType.AIR;
      this.breakingBlock = null;
    }
  }

  physics(deltaTime, xMoveDirection, jump) {
    this.#gravity(deltaTime);
    this.#xMovement(deltaTime, xMoveDirection);
    if (jump) this.#jump(deltaTime);

    this.#updatePositionByVelocity(deltaTime);

    this.world.generateChunks(this);
  }

  #gravity(deltaTime) {
    this.yVel += 0.98;
    const bottomCollision = this.#willCollideBottom(deltaTime);
    if (bottomCollision) this.#stopGravity(bottomCollision);
    else this.isFalling = true;
  }

  #stopGravity(bottomCollision) {
    this.yVel = 0;
    this.y = bottomCollision.yIndex - 0.001;
    this.isFalling = false;
  }

  #xMovement(deltaTime, direction) {
    this.xVel = direction * PLAYER_MOVE_SPEED;
    const xCollision = this.#willCollideX(direction, deltaTime);
    if (xCollision) this.#stopXMovement(xCollision, direction);
  }

  #stopXMovement(xCollision, direction) {
    this.xVel = 0;
    this.x =
      direction > 0
        ? xCollision.xIndex - 0.01 - this.width * 0.5 // right
        : xCollision.xIndex + 1 + 0.01 + this.width * 0.5; // left
  }

  #jump(deltaTime) {
    if (this.isFalling) return;

    this.yVel = -11.5;
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

  getEyePosition() {
    return [this.x + this.width / 2, this.y - this.height - 0.2];
  }
}
