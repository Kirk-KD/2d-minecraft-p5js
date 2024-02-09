import { BlockType } from "./block.js";
import { BLOCK_SIZE } from "./config.js";

const encodedImages = {
  dirt: "data:image/webp;base64,UklGRhoBAABXRUJQVlA4TA0BAAAvn8AnAIWjtpEECdnA2N0DsTROy7xUqfrWw0jbyLkJKTz0+I20jTT/Bo89e1YR/Wfktm0Y+wNKLobT7QP/n/B7Z/naW26QHoTpHB7LFouyKHlzeHxfCStSuj9KdbC8z1IJ5iWiyQed48vtYJ+lUu0t4VwranS1XMIutSiLYlbb8G54uf2p3VPSfRZtSrlsPFjOzZZrd/us3B3uK+HcHJQql+xbLMrS/WqNpm6DeZ/VIPVYaN/KzUbp91nd9xl5pYu50dU2W417nbdTj5l2Ne92uM9qXNpyf6+oXkabHKXaZ1HS4Iaqpim+1KIJ+0M49/LjNbTGP5mrrMZEuc7Uzcb1ViOJ6TuOt4NGJs+zDgA=",
  grass: 'data:image/webp;base64,UklGRngBAABXRUJQVlA4TGsBAAAvn8AnAHXArW1bVVUZZVgRtMEgJSN0d/ju7n2tcfY56fluSNpI0gk5eOjx+08tjCMkbSTp/AsoH1XHnj07Ef2H2DaSI6mYQPW86XUR7AL2ATuAISYrQAswB5wDaI4pYASYADqABmAByM/ZA9BsRwXWBbYFCntgDOgC6KyuC1wUoBOn06B56dRmgPyc0wI070uBPoD2IGUNoC60py8AVwXuC1DTJqANoFZpOSbVGfBpsgF8ij4AdVkAqEvxPqD2tlb5OdX3gK1L7S+gztjU5FP0D2xTZuqoE1HUU/s08ZvtV0Q/j7Qck19RfQb4zaG28tvs+Tl+U6q7Vt26EZ3zcyKa2rqo91t+s6nt83Ni38/gUzo3EfdqOTsRz+tsZ2rrrN6r2Z4d5udEPGlT9+A/oPsy9U5ObZWfozZ1PKFQ6hbP1FE3bGUP+L35sd2h2fal+u1CVk7ERH73TLG7MXsnYhOr73FsZxCxk9NzPgEA'
};

export let blocksTextures = {};

export function loadBlocksTextures(p5) {
  Object.values(BlockType).forEach((name) => {
    if (name === "air") return;
    loadBlockTexture(p5, name);
  });
}

function loadBlockTexture(p5, name) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = BLOCK_SIZE;
  canvas.height = BLOCK_SIZE;

  let img = new Image();
  img.src = encodedImages[name];
  img.onload = () => {
    ctx.drawImage(img, 0, 0, BLOCK_SIZE, BLOCK_SIZE);
    blocksTextures[name] = p5.loadImage(
      canvas.toDataURL(),
      () => { },
      (err) => p5.print(err),
    );
  };
}
