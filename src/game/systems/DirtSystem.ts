import { Particle } from "../core/Particle";
import { ParticlePool } from "../core/ParticlePool";
import { CoverageMap } from "../core/CoverageMap";
import { DirtLayer } from "../core/DirtLayer";
import { LevelConfig } from "../types";
import { DirtType } from "../types/DirtTypes";
import { DIRT_CONFIGS } from "../config/DirtConfigs";

export class DirtSystem {
  private dirtLayers: DirtLayer[] = [];
  private allParticles: Particle[] = [];

  constructor(
    private pool: ParticlePool,
    private cov: CoverageMap,
    private rng = Math.random
  ) {}

  spawn(
    level: LevelConfig,
    objectBounds?: { x: number; y: number; width: number; height: number }
  ) {
    // Clear existing dirt
    this.cleanup();

    // Use object bounds if provided, otherwise use full level area
    const bounds = objectBounds || {
      x: 0,
      y: 0,
      width: level.width,
      height: level.height,
    };

    // Create dirt layers based on priority (higher priority = spawned later = on top)
    const dirtTypes = Object.values(DirtType).sort(
      (a, b) => DIRT_CONFIGS[a].layerPriority - DIRT_CONFIGS[b].layerPriority
    );

    // Spawn each dirt type in layers
    dirtTypes.forEach((dirtType, layerIndex) => {
      const layer = new DirtLayer(dirtType, layerIndex, this.pool);
      this.dirtLayers.push(layer);

      const config = DIRT_CONFIGS[dirtType];
      const area = bounds.width * bounds.height;
      const baseCount = (area / 600) | 0; // Base density
      const count = (baseCount * config.spawnWeight) | 0;

      // Spawn clusters of this dirt type
      for (let i = 0; i < count; i++) {
        // Random position in object-relative coordinates
        const x = (this.rng() - 0.5) * bounds.width;
        const y = (this.rng() - 0.5) * bounds.height;

        const newParticles = layer.spawnCluster(x, y);
        this.allParticles.push(...newParticles);

        // Add to coverage map (convert to world coordinates for tracking)
        for (const particle of newParticles) {
          const worldX = bounds.x + bounds.width / 2 + particle.x;
          const worldY = bounds.y + bounds.height / 2 + particle.y;
          this.cov.addAt(worldX, worldY, particle.size);
        }
      }
    });
  }

  getParticles(): Particle[] {
    return this.allParticles;
  }

  removeParticle(particle: Particle) {
    // Remove from the appropriate layer
    const layer = this.dirtLayers.find((l) =>
      l.getParticles().includes(particle)
    );
    if (layer) {
      layer.removeParticle(particle);
    }

    // Remove from all particles list
    const index = this.allParticles.indexOf(particle);
    if (index !== -1) {
      this.allParticles.splice(index, 1);
    }
  }

  getDirtLayers(): DirtLayer[] {
    return this.dirtLayers;
  }

  cleanup() {
    // Clear all layers
    for (const layer of this.dirtLayers) {
      layer.clear();
    }
    this.dirtLayers.length = 0;
    this.allParticles.length = 0;
  }
}
