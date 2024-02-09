/// <reference path="./p5.global-mode.d.ts" />

import {
  setWidth,
  setHeight,
  WIDTH,
  HEIGHT,
  PLAYER_SPRINT_BONUS,
} from "./src/config.js";
import { loadBlocksTextures } from "./src/assets.js";
import Camera from "./src/camera.js";
import World from "./src/world.js";
import Utils from "./src/utils.js";
import Player from "./src/player.js";

let camera;
let world;
let player;

let p5Div;

let prevFrameTime = 0,
  deltaTime = 0;

let debug = false;

new p5((p5) => {
  p5.preload = () => {
    p5Div = document.getElementById("p5-div");
    setWidth(Utils.elementWidth(p5Div));
    setHeight(Utils.elementHeight(p5Div));

    loadBlocksTextures(p5);
    world = new World(p5);
    camera = new Camera(world);
    player = new Player(world, 0.8, 1.8);
  };

  p5.setup = () => {
    const p5Canvas = p5.createCanvas(WIDTH, HEIGHT);
    p5Canvas.parent(p5Div);
  };

  p5.draw = () => {
    let now = p5.millis() / 1000;
    deltaTime = now - prevFrameTime;
    prevFrameTime = now;

    p5.push();

    p5.noStroke();
    p5.noSmooth();
    p5.background(230);

    keyboardInput(p5);

    camera.calibrateDrawingPosition(p5);
    camera.followPlayer(player);
    camera.follow(p5);

    player.draw(p5);
    world.draw(p5, camera);
    if (debug) world.drawDebugBlock(p5, camera);

    p5.pop();

    p5.stroke(0);
    p5.text(p5.frameRate(), 10, 10);
  };

  p5.keyPressed = () => {
    if (p5.keyCode === p5.TAB) {
      debug = !debug;
      return false;
    }
  };
});

const K_A = 65,
  K_S = 83,
  K_D = 68,
  K_W = 87,
  K_SPACE = 32,
  K_SHIFT = 16;

function keyboardInput(p5) {
  const shift = p5.keyIsDown(K_SHIFT);

  let dx = 0;

  if (p5.keyIsDown(K_A)) dx = -1 - PLAYER_SPRINT_BONUS * shift;
  if (p5.keyIsDown(K_D)) dx = 1 + PLAYER_SPRINT_BONUS * shift;
  if (p5.keyIsDown(K_SPACE) && player.isOnGround) player.yVel = -0.25;

  camera.peek(p5.keyIsDown(K_W), p5.keyIsDown(K_S));

  player.physics(deltaTime, dx);
}
