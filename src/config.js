export let WIDTH = 800;
export let HEIGHT = 800;
export let CENTER_X = WIDTH / 2;
export let CENTER_Y = HEIGHT / 2;

export const BLOCK_SIZE = 50;
export const CHUNK_WIDTH = 16;
export const MAX_HEIGHT = 200;

export const LIGHT_DISTANCE = 8;
export const MAX_SKY_LIGHT = 1;
export const MIN_SKY_LIGHT = 0.4;

export const PLAYER_PLACE_BLOCK_COOLDOWN = 250;
export const PLAYER_MOVE_SPEED = 3;
export const PLAYER_SPRINT_MULT = 1.6;
export const PLAYER_JUMP_SPRINT_MULT = 1.4;
export const PLAYER_REACH = 5;

export const CROSSHAIR_SIZE = 20;
export const INVENTORY_SLOT_SIZE = 40;
export const INVENTORY_SLOT_ITEM_SIZE = INVENTORY_SLOT_SIZE - 5;
export const INVENTORY_PADDING = 6;
export const INVENTORY_MARGIN = 16;
export const INVENTORY_SLOT_NET_SIZE = INVENTORY_SLOT_SIZE + INVENTORY_PADDING;
export const HOTBAR_BOTTOM = 30;
export const HOTBAR_SLOT_SIZE = 50;
export const HOTBAR_SLOT_ITEM_SIZE = HOTBAR_SLOT_SIZE - 5;

export function setWidth(width) {
  WIDTH = width;
  CENTER_X = WIDTH / 2;
  console.log("w: ", WIDTH);
}

export function setHeight(height) {
  HEIGHT = height;
  CENTER_Y = HEIGHT / 2;
  console.log("h: ", HEIGHT);
}
