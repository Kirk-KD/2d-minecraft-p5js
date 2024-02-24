/// <reference path="./p5.global-mode.d.ts" />

import {
  setWidth,
  setHeight,
  WIDTH,
  HEIGHT,
  PLAYER_SPRINT_MULT,
} from "./src/config.js";
import { loadTextures, loadFonts } from "./src/assets.js";
import Camera from "./src/camera.js";
import World from "./src/world.js";
import Utils from "./src/utils.js";
import Player from "./src/player.js";
import Crosshair from "./src/crosshair.js";
import LightingCalculation from "./src/lighting.js";
import { loadItems } from "./src/inventory/item.js";
import { loadRecipes } from "./src/crafting.js";

let camera;
let world;
let player;
let crosshair;
let lighting;

let p5Div;

let deltaTime = 0;

let debug = false;

let finishedLoading = false;

new p5((p5) => {
  p5.preload = () => {
    p5Div = document.getElementById("p5-div");
    p5Div.addEventListener("contextmenu", (event) => event.preventDefault());
    setWidth(Utils.elementWidth(p5Div));
    setHeight(Utils.elementHeight(p5Div));

    loadTextures(p5).then(() => {
      loadFonts(p5);
      loadItems();
      loadRecipes();

      world = new World(p5, lighting);
      camera = new Camera(p5, world);
      player = new Player(p5, world, 0.8, 1.8);
      crosshair = new Crosshair(p5, world, camera, player);
      lighting = new LightingCalculation(world, player, 45);

      finishedLoading = true;
    });
  };

  p5.setup = () => {
    const p5Canvas = p5.createCanvas(WIDTH, HEIGHT);
    p5Canvas.parent(p5Div);
  };

  p5.draw = () => {
    if (!finishedLoading) return;

    deltaTime = p5.deltaTime * 0.001;

    p5.push();

    p5.noStroke();
    p5.noSmooth();
    p5.background(163, 235, 255);

    keyboardInput(p5);

    camera.calibrateDrawingPosition(p5);
    camera.followPlayer(player, deltaTime);
    camera.follow(p5);

    lighting.updateLightLevels();
    lighting.updateSun(p5.millis());

    world.draw(p5, camera);
    player.draw(p5);
    if (debug) world.drawDebugBlock(p5, camera);

    crosshair.update(p5, deltaTime);
    crosshair.draw(p5);

    p5.pop();

    player.drawActiveInventory(p5);

    p5.stroke(0);
    p5.text(p5.frameRate(), 10, 10);
  };

  p5.keyPressed = () => {
    if (!finishedLoading) return;

    if (p5.keyCode === p5.TAB) {
      debug = !debug;
      return false;
    }
    if (p5.key === "e") {
      player.toggleInventoryGUI();
    }
  };

  p5.mouseWheel = (event) => {
    if (!finishedLoading) return;

    const dir = event.delta < 0 ? -1 : 1;
    player.inventory.scrollSelectedHotbarSlot(dir);
  };

  p5.mousePressed = () => {
    if (!finishedLoading) return;

    if (p5.mouseButton === p5.LEFT) {
      if (player.isViewingInventory) {
        player.inventory.onLeftClick(p5.mouseX, p5.mouseY);
      }
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
  let dx = 0;
  if (p5.keyIsDown(K_A)) dx = -1;
  if (p5.keyIsDown(K_D)) dx = 1;

  camera.peek(p5.keyIsDown(K_W), p5.keyIsDown(K_S));
  player.physics(deltaTime, dx, p5.keyIsDown(K_SPACE), p5.keyIsDown(K_SHIFT));
}
