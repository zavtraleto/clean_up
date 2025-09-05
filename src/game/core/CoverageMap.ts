export class CoverageMap {
  width: number;
  height: number;
  data: Float32Array;
  total = 0;
  dirty = 0;

  constructor(
    public worldW: number,
    public worldH: number,
    public cellSize: number
  ) {
    this.width = Math.ceil(worldW / cellSize);
    this.height = Math.ceil(worldH / cellSize);
    this.data = new Float32Array(this.width * this.height);
  }

  index(x: number, y: number) {
    return y * this.width + x;
  }

  addAt(px: number, py: number, weight: number) {
    const cx = Math.min(this.width - 1, Math.max(0, (px / this.cellSize) | 0));
    const cy = Math.min(this.height - 1, Math.max(0, (py / this.cellSize) | 0));
    const i = this.index(cx, cy);
    this.data[i] += weight;
    this.total += weight;
    this.dirty += weight;
  }

  removeAt(px: number, py: number, weight: number) {
    const cx = Math.min(this.width - 1, Math.max(0, (px / this.cellSize) | 0));
    const cy = Math.min(this.height - 1, Math.max(0, (py / this.cellSize) | 0));
    const i = this.index(cx, cy);
    const prev = this.data[i];
    const next = Math.max(0, prev - weight);
    this.dirty -= prev - next;
    this.data[i] = next;
  }

  progress() {
    return this.total > 0 ? 1 - this.dirty / this.total : 0;
  }
}
