import { Block } from "./block.js";
import { PLAYER_REACH } from "./config.js";

export default class Crosshair {
  constructor(world, camera, player) {
    this.world = world;
    this.camera = camera;
    this.player = player;
    this.x = 0;
    this.y = 0;
    this.lookingAtX = 0;
    this.lookingAtY = 0;
    this.lookingAtBlock = null;
  }

  update(p5, deltaTime) {
    const [eyeX, eyeY] = this.player.getEyePosition();
    const [mouseX, mouseY] = this.camera.getBlockIndexAtMouse(p5);

    const distance = Math.sqrt(
      Math.pow(mouseX - eyeX, 2) + Math.pow(mouseY - eyeY, 2),
    );
    if (distance <= PLAYER_REACH) {
      this.lookingAtX = mouseX;
      this.lookingAtY = mouseY;
    } else {
      this.lookingAtX = eyeX + (PLAYER_REACH * (mouseX - eyeX)) / distance;
      this.lookingAtY = eyeY + (PLAYER_REACH * (mouseY - eyeY)) / distance;
    }

    this.lookingAtBlock = this.world.getBlockAtBlockIndex(
      this.lookingAtX,
      this.lookingAtY,
    );

    if (p5.mouseIsPressed) {
      if (p5.mouseButton === p5.LEFT) this.leftClickHeld(deltaTime);
      if (p5.mouseButton === p5.RIGHT) this.rightClickHeld(deltaTime);
    }
  }

  leftClickHeld(deltaTime) {
    if (Block.canBreak(this.lookingAtBlock))
      this.player.breakBlock(this.lookingAtBlock, deltaTime);
  }

  rightClickHeld(deltaTime) {}

  draw(p5) {
    if (Block.canHighlight(this.lookingAtBlock))
      this.lookingAtBlock.drawHighlight(p5);
  }
}
