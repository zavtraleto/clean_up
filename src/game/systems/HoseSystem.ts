import { SpatialHash } from "../core/SpatialHash";
import { Particle } from "../core/Particle";
import { ParticleState } from "../types";
import { CoverageMap } from "../core/CoverageMap";
import { DIRT_CONFIGS } from "../config/DirtConfigs";

// HOSES SYSTEM LOL
export class HoseSystem {
  private queryResults: Particle[] = []; // Reused array

  constructor(private hash: SpatialHash, private cov: CoverageMap) {}

  update(
    nozzleX: number,
    nozzleY: number,
    targetX: number,
    targetY: number,
    angleDeg: number,
    range: number,
    force: number
  ) {
    const dirX = targetX - nozzleX;
    const dirY = targetY - nozzleY;
    const len = Math.hypot(dirX, dirY) || 1;
    const ux = dirX / len;
    const uy = dirY / len;
    const angleRad = (angleDeg * Math.PI) / 180;

    this.hash.queryCone(
      nozzleX,
      nozzleY,
      ux,
      uy,
      angleRad,
      range,
      this.queryResults
    );

    for (let i = 0; i < this.queryResults.length; i++) {
      const p = this.queryResults[i];
      const config = DIRT_CONFIGS[p.dirtType];

      // Only work on dirt types that are effective against hose
      if (!config.tools.hoseEffective) {
        continue;
      }

      // Hose can loosen stuck particles (pressure washing effect)
      if (
        p.state === ParticleState.STUCK &&
        Math.random() < 0.4 * config.physics.stickiness
      ) {
        p.state = ParticleState.LOOSE;
        p.fadeTimer = 0; // Reset lifespan timer
        this.cov.removeAt(p.x, p.y, p.size * 0.9);
      }

      // Push loose particles with hose force
      if (p.state === ParticleState.LOOSE) {
        const forceMultiplier = config.removal.removalForce / 50; // Normalize to base force
        p.vx += ux * force * forceMultiplier;
        p.vy += uy * force * forceMultiplier;
      }
    }

    // Debug: log when hose is active
    if (this.queryResults.length > 0 && Math.random() < 0.1) {
      console.log(`Hose affecting ${this.queryResults.length} particles`);
    }
  }
}
