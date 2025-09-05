import { SpatialHash } from "../core/SpatialHash";
import { Particle } from "../core/Particle";
import { ParticleState } from "../types";
import { CoverageMap } from "../core/CoverageMap";

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

      // Hose can loosen stuck particles (pressure washing effect)
      if (p.state === ParticleState.STUCK && Math.random() < 0.4) {
        p.state = ParticleState.LOOSE;
        this.cov.removeAt(p.x, p.y, p.size * 0.9);
      }

      // Push loose particles with hose force
      if (p.state === ParticleState.LOOSE) {
        p.vx += ux * force;
        p.vy += uy * force;
      }
    }

    // Debug: log when hose is active
    if (this.queryResults.length > 0 && Math.random() < 0.1) {
      console.log(`Hose affecting ${this.queryResults.length} particles`);
    }
  }
}
