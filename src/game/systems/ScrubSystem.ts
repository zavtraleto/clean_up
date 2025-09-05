import { ParticleState } from "../types";
import { SpatialHash } from "../core/SpatialHash";
import { CoverageMap } from "../core/CoverageMap";
import { Particle } from "../core/Particle";
import { DIRT_CONFIGS } from "../config/DirtConfigs";

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
      const config = DIRT_CONFIGS[p.dirtType];

      // Only work on dirt types that are effective against scrubbing
      if (!config.tools.scrubEffective) {
        continue;
      }

      if (
        p.state === ParticleState.STUCK &&
        Math.random() < loosen * (0.3 + power * 0.7) * config.physics.stickiness
      ) {
        // Handle grease fade-out vs normal particle physics
        if (config.removal.fadeOut) {
          p.isFading = true;
          p.fadeTimer = 0;
        } else {
          p.state = ParticleState.LOOSE;
          p.fadeTimer = 0; // Reset lifespan timer
        }

        this.cov.removeAt(p.x, p.y, p.size * 0.9);
      }

      if (p.state === ParticleState.LOOSE) {
        const dx = p.x - x;
        const dy = p.y - y;
        const len = Math.hypot(dx, dy) || 1;
        const kickMultiplier = 0.5 + power * 0.5; // Scale kick with movement speed
        const forceMultiplier = config.removal.removalForce / 50; // Normalize to base force

        p.vx += (dx / len) * baseKick * kickMultiplier * forceMultiplier;
        p.vy += (dy / len) * baseKick * kickMultiplier * forceMultiplier;
      }
    }

    this.lastX = x;
    this.lastY = y;
    this.lastT = t;
  }
}
