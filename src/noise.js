export default class PerlinHeight {
  constructor(p5, seed) {
    this.p5 = p5;
    this.seed = seed;

    this.p5.noiseSeed(this.seed);
  }

  getHeight(x) {
    return Math.round(70 + this.p5.noise((this.seed + x) * 0.1) * 15);
  }
}
