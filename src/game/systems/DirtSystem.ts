import { Particle } from "../core/Particle";
import { ParticlePool } from "../core/ParticlePool";
import { CoverageMap } from "../core/CoverageMap";
import { LevelConfig, ParticleState } from "../types";

export class DirtSystem {
  particles: Particle[] = [];

  constructor(
    private pool: ParticlePool,
    private cov: CoverageMap,
    private rng = Math.random
  ) {}

  spawn(
    level: LevelConfig,
    objectBounds?: { x: number; y: number; width: number; height: number }
  ) {
    // Clear existing particles
    this.particles.length = 0;

    // Use object bounds if provided, otherwise use full level area
    const bounds = objectBounds || {
      x: 0,
      y: 0,
      width: level.width,
      height: level.height,
    };
    const area = bounds.width * bounds.height;
    const baseCount = (area / 400) | 0; // ~1 per 20x20px (much denser)

    for (const layer of level.dirtLayers) {
      const count = (baseCount * layer.density) | 0;
      for (let i = 0; i < count; i++) {
        const p = this.pool.acquire();
        if (!p) break;

        // Spawn in object-relative coordinates (centered around 0,0)
        // Since particles layer is now centered, we need relative coordinates
        const x = (this.rng() - 0.5) * bounds.width; // -width/2 to +width/2
        const y = (this.rng() - 0.5) * bounds.height; // -height/2 to +height/2
        const size =
          layer.sizeRange[0] +
          this.rng() * (layer.sizeRange[1] - layer.sizeRange[0]);

        p.reset(x, y, size);
        p.state = ParticleState.STUCK;
        this.particles.push(p);

        // For coverage map, we still need world coordinates
        const worldX = bounds.x + bounds.width / 2 + x;
        const worldY = bounds.y + bounds.height / 2 + y;
        this.cov.addAt(worldX, worldY, size); // weight by size
      }
    }
  }

  cleanup() {
    // Return all particles to pool
    for (const p of this.particles) {
      this.pool.release(p);
    }
    this.particles.length = 0;
  }
}
