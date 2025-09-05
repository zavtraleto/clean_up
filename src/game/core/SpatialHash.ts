import { Particle } from "./Particle";

export class SpatialHash {
  cells: Map<number, Particle[]> = new Map();

  constructor(public cellSize: number) {}

  private key(cx: number, cy: number) {
    return (cx << 16) ^ cy;
  }

  clear() {
    // Reuse arrays instead of creating new ones
    for (const arr of this.cells.values()) {
      arr.length = 0;
    }
  }

  insert(p: Particle) {
    const cx = (p.x / this.cellSize) | 0;
    const cy = (p.y / this.cellSize) | 0;
    p.cellX = cx;
    p.cellY = cy;
    const k = this.key(cx, cy);
    let arr = this.cells.get(k);
    if (!arr) {
      arr = [];
      this.cells.set(k, arr);
    }
    arr.push(p);
  }

  queryCircle(x: number, y: number, r: number, out: Particle[]) {
    out.length = 0; // Clear output array
    const cs = this.cellSize;
    const rcs = ((r / cs) | 0) + 1;
    const cx = (x / cs) | 0;
    const cy = (y / cs) | 0;
    const r2 = r * r;

    for (let dy = -rcs; dy <= rcs; dy++) {
      for (let dx = -rcs; dx <= rcs; dx++) {
        const arr = this.cells.get(this.key(cx + dx, cy + dy));
        if (!arr) continue;
        for (let i = 0; i < arr.length; i++) {
          const p = arr[i];
          const dxp = p.x - x;
          const dyp = p.y - y;
          if (dxp * dxp + dyp * dyp <= r2) {
            out.push(p);
          }
        }
      }
    }
  }

  queryCone(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    angleRad: number,
    range: number,
    out: Particle[]
  ) {
    out.length = 0; // Clear output array
    const cs = this.cellSize;
    const rcs = ((range / cs) | 0) + 1;
    const cx = (x / cs) | 0;
    const cy = (y / cs) | 0;
    const cosT = Math.cos(angleRad);
    const range2 = range * range;

    for (let dy = -rcs; dy <= rcs; dy++) {
      for (let dx = -rcs; dx <= rcs; dx++) {
        const arr = this.cells.get(this.key(cx + dx, cy + dy));
        if (!arr) continue;
        for (let i = 0; i < arr.length; i++) {
          const p = arr[i];
          const vx = p.x - x;
          const vy = p.y - y;
          const d2 = vx * vx + vy * vy;
          if (d2 > range2) continue;
          const len = Math.sqrt(d2) || 1;
          const ux = vx / len;
          const uy = vy / len;
          const dot = ux * dirX + uy * dirY;
          if (dot >= cosT) {
            out.push(p);
          }
        }
      }
    }
  }
}
