export let WIDTH = 800;
export let HEIGHT = 800;

export const BLOCK_SIZE = 50;
export const CHUNK_WIDTH = 16;
export const MAX_HEIGHT = 100;

export const LIGHT_DISTANCE = 8;

export const PLAYER_MOVE_SPEED = 3;
export const PLAYER_SPRINT_BONUS = 0.5;
export const PLAYER_REACH = 4;

export function setWidth(width) {
  WIDTH = width;
  console.log("w: ", WIDTH);
}

export function setHeight(height) {
  HEIGHT = height;
  console.log("h: ", HEIGHT);
}
