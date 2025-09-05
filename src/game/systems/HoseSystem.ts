import { SpatialHash } from "../core/SpatialHash";
import { Particle } from "../core/Particle";
import { ParticleState } from "../types";
import { CoverageMap } from "../core/CoverageMap";
import { DIRT_CONFIGS } from "../config/DirtConfigs";

// HOSES SYSTEM LOL
export class HoseSystem {
  private queryResults: Particle[] = []; // Reused array

  constructor(private hash: SpatialHash, private cov: CoverageMap) {}

  // Clean along a water stream path
  updateStreamPath(
    segments: { x: number; y: number }[],
    streamWidth: number,
    force: number
  ) {
    // Clear previous query results
    this.queryResults.length = 0;

    // Collect all particles along the stream path
    for (const segment of segments) {
      const tempResults: Particle[] = [];
      this.hash.queryCircle(segment.x, segment.y, streamWidth, tempResults);

      // Add to main results if not already included
      for (const particle of tempResults) {
        if (!this.queryResults.includes(particle)) {
          this.queryResults.push(particle);
        }
      }
    }

    // Apply water pressure cleaning to all collected particles
    for (let i = 0; i < this.queryResults.length; i++) {
      const p = this.queryResults[i];
      const config = DIRT_CONFIGS[p.dirtType];

      // Only work on dirt types that are effective against hose
      if (!config.tools.hoseEffective) {
        continue;
      }

      // Find closest stream segment for directional force
      let closestSegment = segments[0];
      let minDistance = Number.MAX_VALUE;

      for (const segment of segments) {
        const distance = Math.hypot(p.x - segment.x, p.y - segment.y);
        if (distance < minDistance) {
          minDistance = distance;
          closestSegment = segment;
        }
      }

      // Calculate flow direction towards object center (end of stream)
      const endSegment = segments[segments.length - 1];
      const flowDirX = endSegment.x - closestSegment.x;
      const flowDirY = endSegment.y - closestSegment.y;
      const flowLen = Math.hypot(flowDirX, flowDirY) || 1;
      const flowUx = flowDirX / flowLen;
      const flowUy = flowDirY / flowLen;

      // Hose can loosen stuck particles (pressure washing effect)
      if (
        p.state === ParticleState.STUCK &&
        Math.random() < 0.6 * config.physics.stickiness // Higher chance for stream cleaning
      ) {
        p.state = ParticleState.LOOSE;
        p.fadeTimer = 0; // Reset lifespan timer
        this.cov.removeAt(p.x, p.y, p.size * 0.9);
      }

      // Push loose particles with water flow direction
      if (p.state === ParticleState.LOOSE) {
        const forceMultiplier = config.removal.removalForce / 50;
        const streamForce = force * forceMultiplier;

        p.vx += flowUx * streamForce;
        p.vy += flowUy * streamForce;
      }
    }
  }

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
