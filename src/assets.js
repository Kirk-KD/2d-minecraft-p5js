import { BlockType } from "./block.js";
import { BLOCK_SIZE } from "./config.js";

const encodedImages = {
  cracks: [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoAgMAAAAHi4lGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAAPT09jIyM+2BbUAAAAAN0Uk5TAP//RFDWIQAAAFxJREFUeJztzcEJADAIADGX7JKdUnCCfiqCyQB3EQAAAAAAAAAAAAAAALDMKdLS0tLS0tLS/elbvgykpaWlpaWlpZ8H0tLS0tLS0tL9aQAAAAAAAAAAAAAAABgvAZalHvCKwZ2eAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoAgMAAAAHi4lGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAAPT09jIyM+2BbUAAAAAN0Uk5TAP//RFDWIQAAAHtJREFUeJzt1qENACAMRcEuyZJMSQIGCUnB9E5VvW8bAQAAAAAAAABAYW2SlpaWlpaWlpaWlpaWlpaWrpPu0z6QNiYtLS0tLS0tfTmwbmlpaWlpaWnpP+kl+bmRlpaWlpaWlj725LmRlpaWlpaWlgYAAAAAAAAAAACATAPJuJ1/VN7aDgAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoAgMAAAAHi4lGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAAPT09jIyM+2BbUAAAAAN0Uk5TAP//RFDWIQAAAJZJREFUeJzt2DEKACEMAEE/6Sd9paBN4LhCMCIyW6WatCGlSJIkSZIkSZIk6YLqCI1Go9FoNBqNRqPRaDQaXUNoNBqNRqPRGXQbRWLOLYRGo9FoNBqdQX8XbODQaDQajUajF4uHDhqNRqPRaDQajUaj0Wj02/REE58saDQajUaj0T+loGg0Go1Go9GSJEmSJEmSJEk6UQcVn6uN8qTBlAAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoAgMAAAAHi4lGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAAPT09jIyM+2BbUAAAAAN0Uk5TAP//RFDWIQAAAMhJREFUeJzt2EEKgDAMAEE/6Sf7SsFeAiFiQIvI7NGWSY/BbZMkSfp8+xkajUaj0Wj0Snqi4wyNRqPRaDR6DZ3RatFpL0BoNBqNRqPRN+g7X9oLEBqNRqPRaHTBxeLpJOJp471oNBqNRqPRl+hIxQH5TuO9aDQajUaj0UXV1TigwaHRaDQajUY/VFx00Gg0Go1Go9FoNBqNRqP/R++px36yoNFoNBqNRl82UnMAGo1Go9Fo9Nt0NQyNRqPRaDR6PS1JkiRJkvSLDhbvBZYbqUJmAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoAgMAAAAHi4lGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAAPT09jIyM+2BbUAAAAAN0Uk5TAP//RFDWIQAAAPZJREFUeJzt1jEOg0AMRUEuuZfklJGg+ZJlYAWbal4Vxc445W5b0zjqpq9Co9FoNBqNvmw/ygMjQqPRaDQajV5H1wN7hEaj0Wg0Gr2Crs+a5LonzqMHEBqNRqPRaPQk3U3r+ZsHEBqNRqPRaPQDOsvp+eOc3nBoNBqNRqPRD+hczfJA7tTDaDQajUaj0bN0/qBOE8qdbh+NRqPRaDR6lq6fu52J0Gg0Go1Goy+rD5cKjQiNRqPRaDT6K7o2SnuERqPRaDQavYKu0Nn5/Qf/F41Go9FoNPoSrdM8kKHRaDQajUa/pzu07mRoNBqNRqPR72lJkqQ/9gO15K5PTvX3QwAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWkAAAFoAgMAAADoSeJ4AAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAAPT09jIyM+2BbUAAAAAN0Uk5TAP//RFDWIQAAAQ9JREFUeJztzrENwzAQA8CMliW8T+bJlCnSECDecCylO1aC9H/U41E5Iv26FjabzWaz2ew7eUeyYUcnm81ms9ls9tVMe9mQnZPAZrPZbDabvcvOvZxK9fwX0z2bzWaz2Wz2Pbun+nze1r97stlsNpvNZm+1M/ma292TMy82m81ms9nsZTtnM9mQM908h81ms9lsNvs3Ozfy5ntOaZphs9lsNpvN/oc99UxSdrLZbDabzWbvtVOaNo7ItMtms9lsNpu9y+4clXdk6mGz2Ww2m81et/u9pfS+M3nPZrPZbDabvdfOvVSvTPa/2Gw2m81ms9ft3MvtnsnmK/NsNpvNZrPZK3b3rN+z2Ww2m81m37I/nGD4hwXXmEAAAAAASUVORK5CYII=",
  ],
};

const itemIDs = ["stick"];

export let blocksTextures = {};
export let itemsTextures = {};
export let textures = {
  cracks: [],
};
export let fonts = {
  minecraft: null,
  minecraftItalic: null,
  minecraftBold: null,
  minecraftBoldItalic: null,
};

export function loadTextures(p5) {
  let promises = [];

  Object.values(BlockType).forEach((name) => {
    if (name === "air") return;
    promises.push(
      loadTexture(p5, `../images/blocks/${name}.webp`).then((img) => {
        blocksTextures[name] = img;
      }),
    );
  });

  itemIDs.forEach((id) => {
    promises.push(
      loadTexture(p5, `../images/items/${id}.webp`).then((img) => {
        itemsTextures[id] = img;
      }),
    );
  });

  encodedImages.cracks.forEach((data) => {
    promises.push(
      loadTexture(p5, data).then((img) => {
        textures.cracks.push(img);
      }),
    );
  });

  return Promise.all(promises);
}

function loadTexture(p5, path) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = BLOCK_SIZE;
    canvas.height = BLOCK_SIZE;

    let img = new Image();
    img.src = path;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, BLOCK_SIZE, BLOCK_SIZE);
      resolve(
        p5.loadImage(
          canvas.toDataURL(),
          () => {},
          (err) => p5.print(err),
        ),
      );
    };
  });
}

export function loadFonts(p5) {
  fonts.minecraft = p5.loadFont("./fonts/minecraft.otf");
  fonts.minecraftItalic = p5.loadFont("../fonts/minecraft_italic.otf");
  fonts.minecraftBold = p5.loadFont("../fonts/minecraft_bold.otf");
  fonts.minecraftBoldItalic = p5.loadFont("../fonts/minecraft_bold_italic.otf");
}
