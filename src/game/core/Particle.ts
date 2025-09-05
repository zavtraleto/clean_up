import { ParticleState } from "../types";

export class Particle {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  size = 2;
  state: ParticleState = ParticleState.STUCK;
  cellX = 0;
  cellY = 0;
  alive = true;

  reset(x: number, y: number, size: number) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.size = size;
    this.state = ParticleState.STUCK;
    this.alive = true;
  }
}
