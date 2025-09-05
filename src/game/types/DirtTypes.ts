export enum DirtType {
  SAND = "sand",
  MUD = "mud",
  GREASE = "grease",
}

export interface DirtVisualConfig {
  color: number;
  alpha: number;
  minSize: number;
  maxSize: number;
  shape: "circle" | "square" | "blob";
  texture?: string;
}

export interface DirtPhysicsConfig {
  gravity: number;
  damping: number;
  mass: number;
  bounce: number;
  stickiness: number; // How hard to remove when stuck
  clumpSize: number; // How many particles spawn together
  spread: number; // How far apart particles spawn in a clump
}

export interface DirtToolConfig {
  scrubEffective: boolean;
  hoseEffective: boolean;
  // Future tools can be added here
}

export interface DirtRemovalConfig {
  fadeOut: boolean; // If true, particles fade instead of flying
  fadeTime: number; // Time to fade out (if fadeOut is true)
  flyLifespan: number; // How long particles live when flying (if not fadeOut)
  removalForce: number; // How much force to apply when removed
}

export interface DirtLayerConfig {
  type: DirtType;
  visual: DirtVisualConfig;
  physics: DirtPhysicsConfig;
  tools: DirtToolConfig;
  removal: DirtRemovalConfig;
  spawnWeight: number; // Probability weight for spawning this type
  layerPriority: number; // Higher numbers spawn on top
}
