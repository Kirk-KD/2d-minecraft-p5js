import { BlockType } from "./block.js";
import { BLOCK_SIZE } from "./config.js";

const encodedImages = {
  dirt: "data:image/webp;base64,UklGRhoBAABXRUJQVlA4TA0BAAAvn8AnAIWjtpEECdnA2N0DsTROy7xUqfrWw0jbyLkJKTz0+I20jTT/Bo89e1YR/Wfktm0Y+wNKLobT7QP/n/B7Z/naW26QHoTpHB7LFouyKHlzeHxfCStSuj9KdbC8z1IJ5iWiyQed48vtYJ+lUu0t4VwranS1XMIutSiLYlbb8G54uf2p3VPSfRZtSrlsPFjOzZZrd/us3B3uK+HcHJQql+xbLMrS/WqNpm6DeZ/VIPVYaN/KzUbp91nd9xl5pYu50dU2W417nbdTj5l2Ne92uM9qXNpyf6+oXkabHKXaZ1HS4Iaqpim+1KIJ+0M49/LjNbTGP5mrrMZEuc7Uzcb1ViOJ6TuOt4NGJs+zDgA=",
  grass:
    "data:image/webp;base64,UklGRngBAABXRUJQVlA4TGsBAAAvn8AnAHXArW1bVVUZZVgRtMEgJSN0d/ju7n2tcfY56fluSNpI0gk5eOjx+08tjCMkbSTp/AsoH1XHnj07Ef2H2DaSI6mYQPW86XUR7AL2ATuAISYrQAswB5wDaI4pYASYADqABmAByM/ZA9BsRwXWBbYFCntgDOgC6KyuC1wUoBOn06B56dRmgPyc0wI070uBPoD2IGUNoC60py8AVwXuC1DTJqANoFZpOSbVGfBpsgF8ij4AdVkAqEvxPqD2tlb5OdX3gK1L7S+gztjU5FP0D2xTZuqoE1HUU/s08ZvtV0Q/j7Qck19RfQb4zaG28tvs+Tl+U6q7Vt26EZ3zcyKa2rqo91t+s6nt83Ni38/gUzo3EfdqOTsRz+tsZ2rrrN6r2Z4d5udEPGlT9+A/oPsy9U5ObZWfozZ1PKFQ6hbP1FE3bGUP+L35sd2h2fal+u1CVk7ERH73TLG7MXsnYhOr73FsZxCxk9NzPgEA",
  wood: "data:image/webp;base64,UklGRvAAAABXRUJQVlA4TOQAAAAvn8AnAC+gpm0jODl2au+/A3FEAqTByAA0+kO1bduwqcktbc78x/9nDgVvuw0gcBRJbhiJwlIQhaUgCuYPZlSbu69eEf2fAFMcOiwOHRbNoTg0m5ftsZk8Nv/g8LIVO/yDuCg8b8PFTEQzaS7FZHjZxE/F5DFpmuJiHjVTNIfiIiZD8cY1f9OhOTQXh4eumJjL0OHSXJqXbRWXR4efmsnwxq3ibxwm4mIWz9s6XJpmMTGvnfivR4fFx0U8ao/JOlyGSTNx2Lxsppg4FIeJmKT3bJgMHQ6Lppisw2snJuKn9VPzngE=",
  leaves:
    "data:image/webp;base64,UklGRgIBAABXRUJQVlA4TPYAAAAvn8AnECegqG0bOFUM92uMpiYAATZmZXBJQlHbNlBvKOMPcI/5DwD+9zpbMQ9oIkkNFrDwFrCAf1P380lNFdH/CRCLTYXDpcJihxWKw3tmje1ww6cJl8YetabR1w6XE27YNB2esuXQLIdJ0Vi93jhbNLa+KiwOl8bes2eFTx1WuOGE92wpNosdDvdVbBbFG2eNNeLT0FhjNzxlzQqXQ3Go0FjRWGPvWdo01iyHyYTL4oT3zBprxKKxwwo3vHEVdigOxXodKiwetWJTYWKL4nDDoWlWeM8mXE7YTPb1yd4z0SyHy8RWqLA5YfGopRtW+GQ7TPT1gAE=",

  cracks: [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoAgMAAAAHi4lGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAAPT09jIyM+2BbUAAAAAN0Uk5TAP//RFDWIQAAAFxJREFUeJztzcEJADAIADGX7JKdUnCCfiqCyQB3EQAAAAAAAAAAAAAAALDMKdLS0tLS0tLS/elbvgykpaWlpaWlpZ8H0tLS0tLS0tL9aQAAAAAAAAAAAAAAABgvAZalHvCKwZ2eAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoAgMAAAAHi4lGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAAPT09jIyM+2BbUAAAAAN0Uk5TAP//RFDWIQAAAHtJREFUeJzt1qENACAMRcEuyZJMSQIGCUnB9E5VvW8bAQAAAAAAAABAYW2SlpaWlpaWlpaWlpaWlpaWrpPu0z6QNiYtLS0tLS0tfTmwbmlpaWlpaWnpP+kl+bmRlpaWlpaWlj725LmRlpaWlpaWlgYAAAAAAAAAAACATAPJuJ1/VN7aDgAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoAgMAAAAHi4lGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAAPT09jIyM+2BbUAAAAAN0Uk5TAP//RFDWIQAAAJZJREFUeJzt2DEKACEMAEE/6Sd9paBN4LhCMCIyW6WatCGlSJIkSZIkSZIk6YLqCI1Go9FoNBqNRqPRaDQaXUNoNBqNRqPRGXQbRWLOLYRGo9FoNBqdQX8XbODQaDQajUajF4uHDhqNRqPRaDQajUaj0Wj02/REE58saDQajUaj0T+loGg0Go1Go9GSJEmSJEmSJEk6UQcVn6uN8qTBlAAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoAgMAAAAHi4lGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAAPT09jIyM+2BbUAAAAAN0Uk5TAP//RFDWIQAAAMhJREFUeJzt2EEKgDAMAEE/6Sf7SsFeAiFiQIvI7NGWSY/BbZMkSfp8+xkajUaj0Wj0Snqi4wyNRqPRaDR6DZ3RatFpL0BoNBqNRqPRN+g7X9oLEBqNRqPRaHTBxeLpJOJp471oNBqNRqPRl+hIxQH5TuO9aDQajUaj0UXV1TigwaHRaDQajUY/VFx00Gg0Go1Go9FoNBqNRqP/R++px36yoNFoNBqNRl82UnMAGo1Go9Fo9Nt0NQyNRqPRaDR6PS1JkiRJkvSLDhbvBZYbqUJmAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoAgMAAAAHi4lGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAAPT09jIyM+2BbUAAAAAN0Uk5TAP//RFDWIQAAAPZJREFUeJzt1jEOg0AMRUEuuZfklJGg+ZJlYAWbal4Vxc445W5b0zjqpq9Co9FoNBqNvmw/ygMjQqPRaDQajV5H1wN7hEaj0Wg0Gr2Crs+a5LonzqMHEBqNRqPRaPQk3U3r+ZsHEBqNRqPRaPQDOsvp+eOc3nBoNBqNRqPRD+hczfJA7tTDaDQajUaj0bN0/qBOE8qdbh+NRqPRaDR6lq6fu52J0Gg0Go1Goy+rD5cKjQiNRqPRaDT6K7o2SnuERqPRaDQavYKu0Nn5/Qf/F41Go9FoNPoSrdM8kKHRaDQajUa/pzu07mRoNBqNRqPR72lJkqQ/9gO15K5PTvX3QwAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWkAAAFoAgMAAADoSeJ4AAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAAPT09jIyM+2BbUAAAAAN0Uk5TAP//RFDWIQAAAQ9JREFUeJztzrENwzAQA8CMliW8T+bJlCnSECDecCylO1aC9H/U41E5Iv26FjabzWaz2ew7eUeyYUcnm81ms9ls9tVMe9mQnZPAZrPZbDabvcvOvZxK9fwX0z2bzWaz2Wz2Pbun+nze1r97stlsNpvNZm+1M/ma292TMy82m81ms9nsZTtnM9mQM908h81ms9lsNvs3Ozfy5ntOaZphs9lsNpvN/oc99UxSdrLZbDabzWbvtVOaNo7ItMtms9lsNpu9y+4clXdk6mGz2Ww2m81et/u9pfS+M3nPZrPZbDabvdfOvVSvTPa/2Gw2m81ms9ft3MvtnsnmK/NsNpvNZrPZK3b3rN+z2Ww2m81m37I/nGD4hwXXmEAAAAAASUVORK5CYII=",
  ],
};

export let blocksTextures = {};
export let textures = {
  cracks: [],
};

export function loadTextures(p5) {
  Object.values(BlockType).forEach((name) => {
    if (name === "air") return;
    loadTexture(p5, encodedImages[name], (img) => {
      blocksTextures[name] = img;
    });
  });

  encodedImages.cracks.forEach((data) => {
    loadTexture(p5, data, (img) => {
      textures.cracks.push(img);
    });
  });
}

function loadTexture(p5, data, callback) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = BLOCK_SIZE;
  canvas.height = BLOCK_SIZE;

  let img = new Image();
  img.src = data;
  img.onload = () => {
    ctx.drawImage(img, 0, 0, BLOCK_SIZE, BLOCK_SIZE);
    callback(
      p5.loadImage(
        canvas.toDataURL(),
        () => {},
        (err) => p5.print(err),
      ),
    );
  };
}
