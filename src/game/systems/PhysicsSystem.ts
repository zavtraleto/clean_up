import { Particle } from "../core/Particle";
import { ParticleState } from "../types";

export class PhysicsSystem {
  constructor(private objectWidth: number, private objectHeight: number) {}

  integrate(p: Particle, dt: number) {
    // Only apply physics to LOOSE particles - STUCK particles stay in place
    if (p.state !== ParticleState.LOOSE) {
      return;
    }

    // Apply stronger damping for slower movement
    p.vx *= 0.92;
    p.vy *= 0.92;

    // Add gravity for realistic fall
    p.vy += 120 * dt;

    // Apply velocity with much slower movement
    p.x += p.vx * dt * 8;
    p.y += p.vy * dt * 8;

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
  }
}
