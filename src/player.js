import { PLAYER_MOVE_SPEED, BLOCK_SIZE, WIDTH, CHUNK_WIDTH } from "./config.js";
import { Block, BlockType, blocks } from "./block.js";

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

  #onBlockBroken() {
    this.breakingBlockAmount = 0;
    // this.breakingBlock.type = BlockType.AIR;
    // this.breakingBlock.isBackground = false;
    this.breakingBlock.replace(blocks.AirBlock);
    this.breakingBlock = null;
  }

  physics(deltaTime, xMoveDirection, jump) {
    // going up, check for top collision
    if (this.yVel < 0) {
      this.isJumping = true;

      const topCollision = this.#willCollideTop(deltaTime);
      if (topCollision) this.#stopJump(topCollision);
    }

    if (this.isJumping) xMoveDirection *= 1.2;

    this.#gravity(deltaTime);
    this.#xMovement(deltaTime, xMoveDirection);

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

  #xMovement(deltaTime, direction) {
    this.xVel = direction * PLAYER_MOVE_SPEED;

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
