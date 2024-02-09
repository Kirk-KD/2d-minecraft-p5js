import { PLAYER_MOVE_SPEED, BLOCK_SIZE, MAX_HEIGHT } from "./config.js";
import { BlockType } from "./block.js";
import Utils from "./utils.js";

export default class Player {
  constructor(world, width, height) {
    this.world = world;
    this.width = width;
    this.height = height;
    this.x = 0;
    this.y = 0;
    this.yVel = 0;
    this.xVel = 0;

    this.isOnGround = true;
  }

  physics(deltaTime, xMoveDirection) {
    const newXVel = deltaTime * xMoveDirection * PLAYER_MOVE_SPEED;
    const newYVel = Utils.clamp(
      this.yVel + deltaTime * 0.981,
      -100,
      55 * deltaTime,
    );

    const nextBlockXLeft = this.world.getBlockAtBlockIndex(
      this.x + newXVel - this.width * 0.5,
      this.y,
    );
    const nextBlockXRight = this.world.getBlockAtBlockIndex(
      this.x + newXVel + this.width * 0.5,
      this.y,
    );
    this.xVel =
      (nextBlockXLeft === undefined || nextBlockXLeft.type === BlockType.AIR) &&
      (nextBlockXRight === undefined || nextBlockXRight.type === BlockType.AIR)
        ? newXVel
        : 0;

    const nextBlockYLeft = this.world.getBlockAtBlockIndex(
      this.x - this.width * 0.5,
      this.y + newYVel,
    );
    const nextBlockYRight = this.world.getBlockAtBlockIndex(
      this.x + this.width * 0.5,
      this.y + newYVel,
    );
    if (
      (nextBlockYLeft === undefined || nextBlockYLeft.type === BlockType.AIR) &&
      (nextBlockYRight === undefined || nextBlockYRight.type === BlockType.AIR)
    ) {
      this.yVel = newYVel;
      this.isOnGround = false;
    } else {
      this.yVel = 0;
      this.isOnGround = true;
    }

    this.x += this.xVel;
    this.y += this.yVel;

    this.world.generateChunks(this);
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
}
