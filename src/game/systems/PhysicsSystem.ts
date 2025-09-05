import { Particle } from "../core/Particle";
import { ParticleState } from "../types";

export class PhysicsSystem {
  constructor(private width: number, private height: number) {}

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

    // Boundary check
    if (p.x < 0 || p.x > this.width || p.y < 0 || p.y > this.height) {
      p.alive = false;
    }
  }
}
