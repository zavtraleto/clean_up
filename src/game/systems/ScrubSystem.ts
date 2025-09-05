import { ParticleState } from "../types";
import { SpatialHash } from "../core/SpatialHash";
import { CoverageMap } from "../core/CoverageMap";
import { Particle } from "../core/Particle";

export class ScrubSystem {
  lastX = 0;
  lastY = 0;
  lastT = 0;
  private queryResults: Particle[] = []; // Reused array

  constructor(private hash: SpatialHash, private cov: CoverageMap) {}

  update(
    x: number,
    y: number,
    t: number,
    radius: number,
    loosen: number,
    baseKick: number
  ) {
    const dt = Math.max(0.016, Math.min(0.05, t - this.lastT || 0.016));
    const vx = (x - this.lastX) / dt;
    const vy = (y - this.lastY) / dt;
    const speed = Math.hypot(vx, vy);
    const power = Math.min(1, speed / 800); // Lower threshold for better responsiveness

    this.hash.queryCircle(x, y, radius, this.queryResults);

    for (let i = 0; i < this.queryResults.length; i++) {
      const p = this.queryResults[i];

      if (
        p.state === ParticleState.STUCK &&
        Math.random() < loosen * (0.3 + power * 0.7)
      ) {
        p.state = ParticleState.LOOSE;
        this.cov.removeAt(p.x, p.y, p.size * 0.9);
      }

      if (p.state === ParticleState.LOOSE) {
        const dx = p.x - x;
        const dy = p.y - y;
        const len = Math.hypot(dx, dy) || 1;
        const kickMultiplier = 0.5 + power * 0.5; // Scale kick with movement speed
        p.vx += (dx / len) * baseKick * kickMultiplier;
        p.vy += (dy / len) * baseKick * kickMultiplier;
      }
    }

    this.lastX = x;
    this.lastY = y;
    this.lastT = t;
  }
}
