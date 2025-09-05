import { Particle } from "../core/Particle";
import { ParticleState } from "../types";
import { DIRT_CONFIGS } from "../config/DirtConfigs";

export class PhysicsSystem {
  constructor(private objectWidth: number, private objectHeight: number) {}

  integrate(p: Particle, dt: number) {
    // Handle fade-out effect for grease and similar dirt types
    if (p.isFading) {
      p.fadeTimer += dt;
      const config = DIRT_CONFIGS[p.dirtType];

      if (p.fadeTimer >= config.removal.fadeTime) {
        p.alive = false;
        return;
      }

      // Fade out alpha
      const fadeProgress = p.fadeTimer / config.removal.fadeTime;
      p.alpha = config.visual.alpha * (1 - fadeProgress);
      return;
    }

    // Only apply physics to LOOSE particles - STUCK particles stay in place
    if (p.state !== ParticleState.LOOSE) {
      return;
    }

    const config = DIRT_CONFIGS[p.dirtType];

    // Apply dirt-specific damping
    p.vx *= config.physics.damping;
    p.vy *= config.physics.damping;

    // Add dirt-specific gravity
    p.vy += config.physics.gravity * dt;

    // Apply velocity with dirt-specific mass effect
    const massMultiplier = 1 / config.physics.mass;
    p.x += p.vx * dt * 8 * massMultiplier;
    p.y += p.vy * dt * 8 * massMultiplier;

    // Boundary check - use much larger bounds since particles are in object-relative coordinates
    // Allow particles to fly far beyond the object before removing them
    const maxDistance = Math.max(this.objectWidth, this.objectHeight) * 4; // 4x the object size
    if (
      p.x < -maxDistance ||
      p.x > maxDistance ||
      p.y < -maxDistance ||
      p.y > maxDistance
    ) {
      p.alive = false;
    }

    // Handle flying particle lifespan for non-fading dirt types
    if (!config.removal.fadeOut && p.state === ParticleState.LOOSE) {
      p.fadeTimer += dt; // Reuse fadeTimer for lifespan tracking
      if (p.fadeTimer >= config.removal.flyLifespan) {
        p.alive = false;
      }
    }
  }
}
