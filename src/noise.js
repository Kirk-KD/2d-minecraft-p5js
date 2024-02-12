export default class PerlinGeneration {
  constructor(p5, seed) {
    this.p5 = p5;
    this.seed = seed || Math.random() * 9999999999999;

    this.p5.noiseSeed(this.seed);
  }

  getHeight(x) {
    return Math.round(70 + this.p5.noise((this.seed + x) * 0.1) * 15);
  }

  getTree(x) {
    return this.p5.noise((this.seed * Math.PI + x) * 0.1);
  }
}
