export type Vec2 = { x: number; y: number };

export enum ParticleState {
  STUCK = 0,
  LOOSE = 1,
  EXITING = 2,
}

export interface DirtConfig {
  density: number; // 0..1 overall particle count scalar
  stickiness: number; // 0..1 chance to resist loosening
  sizeRange: [number, number]; // pixel sizes
}

export interface LevelConfig {
  id: string;
  image: string; // path
  width: number; // world px
  height: number; // world px
  threshold: number; // e.g., 0.95
  dirtLayers: DirtConfig[];
}

export interface ToolsConfig {
  scrub: { radius: number; loosenChance: number; baseKick: number };
  hose: { angleDeg: number; range: number; force: number };
}

export interface GameState {
  playing: boolean;
  completed: boolean;
  progress: number;
}

export interface GameEvents {
  onComplete: () => void;
  onProgressUpdate: (progress: number) => void;
}
