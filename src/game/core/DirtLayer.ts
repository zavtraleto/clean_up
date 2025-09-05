import { Particle } from "./Particle";
import { ParticlePool } from "./ParticlePool";
import { DirtType, DirtLayerConfig } from "../types/DirtTypes";
import { DIRT_CONFIGS } from "../config/DirtConfigs";

export class DirtLayer {
  private particles: Particle[] = [];
  private config: DirtLayerConfig;

  constructor(
    public readonly type: DirtType,
    public readonly layer: number,
    private pool: ParticlePool
  ) {
    this.config = DIRT_CONFIGS[type];
  }

  spawnCluster(centerX: number, centerY: number): Particle[] {
    const newParticles: Particle[] = [];
    const clumpSize = this.config.physics.clumpSize;
    const spread = this.config.physics.spread;

    for (let i = 0; i < clumpSize; i++) {
      const particle = this.pool.acquire();
      if (!particle) break;

      // Position particles in cluster formation
      const angle = (i / clumpSize) * Math.PI * 2;
      const distance = Math.random() * spread;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      // Random size within config range
      const size =
        this.config.visual.minSize +
        Math.random() *
          (this.config.visual.maxSize - this.config.visual.minSize);

      particle.reset(x, y, size, this.type);
      particle.layer = this.layer;
      particle.color = this.config.visual.color;
      particle.alpha = this.config.visual.alpha;
      particle.shape = this.config.visual.shape;

      this.particles.push(particle);
      newParticles.push(particle);
    }

    return newParticles;
  }

  removeParticle(particle: Particle) {
    const index = this.particles.indexOf(particle);
    if (index !== -1) {
      this.particles.splice(index, 1);
      this.pool.release(particle);
    }
  }

  getParticles(): Particle[] {
    return this.particles;
  }

  getConfig(): DirtLayerConfig {
    return this.config;
  }

  clear() {
    for (const particle of this.particles) {
      this.pool.release(particle);
    }
    this.particles.length = 0;
  }
}
