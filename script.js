/// <reference path="./p5.global-mode.d.ts" />

import {
  setWidth,
  setHeight,
  WIDTH,
  HEIGHT,
  PLAYER_SPRINT_BONUS,
} from "./src/config.js";
import { loadTextures } from "./src/assets.js";
import Camera from "./src/camera.js";
import World from "./src/world.js";
import Utils from "./src/utils.js";
import Player from "./src/player.js";
import Crosshair from "./src/crosshair.js";
import LightingCalculation from "./src/lighting.js";

let camera;
let world;
let player;
let crosshair;
let lighting;

let p5Div;

let deltaTime = 0;

let debug = false;

new p5((p5) => {
  p5.preload = () => {
    p5Div = document.getElementById("p5-div");
    setWidth(Utils.elementWidth(p5Div));
    setHeight(Utils.elementHeight(p5Div));

    loadTextures(p5);
    world = new World(p5, lighting);
    camera = new Camera(p5, world);
    player = new Player(p5, world, 0.8, 1.8);
    crosshair = new Crosshair(p5, world, camera, player);
    lighting = new LightingCalculation(world, player);
  };

  p5.setup = () => {
    const p5Canvas = p5.createCanvas(WIDTH, HEIGHT);
    p5Canvas.parent(p5Div);
  };

  p5.draw = () => {
    deltaTime = p5.deltaTime * 0.001;

    p5.push();

    p5.noStroke();
    p5.noSmooth();
    p5.background(230);

    keyboardInput(p5);

    camera.calibrateDrawingPosition(p5);
    camera.followPlayer(player, deltaTime);
    camera.follow(p5);

    lighting.updateLightLevels();

    player.draw(p5);
    world.draw(p5, camera);
    if (debug) world.drawDebugBlock(p5, camera);

    crosshair.update(p5, deltaTime);
    crosshair.draw(p5);

    p5.pop();

    p5.stroke(0);
    p5.text(p5.frameRate(), 10, 10);
  };

  p5.keyPressed = () => {
    if (p5.keyCode === p5.TAB) {
      lighting.updateLightLevels();

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

  camera.peek(p5.keyIsDown(K_W), p5.keyIsDown(K_S));

  player.physics(deltaTime, dx, p5.keyIsDown(K_SPACE));
}
