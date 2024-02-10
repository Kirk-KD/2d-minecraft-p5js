import { WIDTH, HEIGHT, BLOCK_SIZE } from "./config.js";

export default class Camera {
  constructor(world) {
    this.world = world;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.targetXOffset = 0;
    this.targetYOffset = 0;
  }

  calibrateDrawingPosition(p5) {
    p5.translate(
      WIDTH / 2 - this.x * BLOCK_SIZE,
      HEIGHT / 2 + this.y * BLOCK_SIZE,
    );
  }

  followPlayer(player, deltaTime) {
    this.targetX = player.x - player.xVel * deltaTime;
    this.targetY = -(player.y - player.yVel * deltaTime - 3);
  }

  follow(p5) {
    this.x = p5.lerp(this.x, this.targetX + this.targetXOffset, 0.3);
    this.y = p5.lerp(this.y, this.targetY + this.targetYOffset, 0.3);
  }

  peek(w, s) {
    if (w && s) return;

    if (!w && !s) this.targetYOffset = 0;
    else this.targetYOffset = w ? 5 : -5;
  }

  getBlockIndexAtMouse(p5) {
    return [
      (p5.mouseX - WIDTH / 2) / BLOCK_SIZE + this.x,
      (p5.mouseY - HEIGHT / 2) / BLOCK_SIZE - this.y,
    ];
  }
}
