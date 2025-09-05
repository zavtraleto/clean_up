import { ParticleState } from "../types";
import { DirtType } from "../types/DirtTypes";

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

  // New dirt type properties
  dirtType: DirtType = DirtType.SAND;
  color = 0xd2b48c;
  alpha = 1;
  shape: "circle" | "square" | "blob" = "circle";
  layer = 0; // Layer depth (0 = bottom, higher = top)
  fadeTimer = 0; // For grease fade-out effect
  isFading = false;

  reset(
    x: number,
    y: number,
    size: number,
    dirtType: DirtType = DirtType.SAND
  ) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.size = size;
    this.state = ParticleState.STUCK;
    this.alive = true;
    this.dirtType = dirtType;
    this.layer = 0;
    this.fadeTimer = 0;
    this.isFading = false;
  }
}
