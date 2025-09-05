import { DirtType, DirtLayerConfig } from "../types/DirtTypes";

export const DIRT_CONFIGS: Record<DirtType, DirtLayerConfig> = {
  [DirtType.SAND]: {
    type: DirtType.SAND,
    visual: {
      color: 0xd2b48c, // Sandy brown
      alpha: 0.8,
      minSize: 1,
      maxSize: 3,
      shape: "circle",
    },
    physics: {
      gravity: 100,
      damping: 0.95,
      mass: 1,
      bounce: 0.3,
      stickiness: 0.3, // Easy to remove
      clumpSize: 3, // Small clusters
      spread: 8,
    },
    tools: {
      scrubEffective: true,
      hoseEffective: false,
    },
    removal: {
      fadeOut: false,
      fadeTime: 0,
      flyLifespan: 3.0, // Moderate lifespan
      removalForce: 50,
    },
    spawnWeight: 1,
    layerPriority: 1, // Bottom layer
  },

  [DirtType.MUD]: {
    type: DirtType.MUD,
    visual: {
      color: 0x8b4513, // Saddle brown
      alpha: 0.9,
      minSize: 3,
      maxSize: 7,
      shape: "blob",
    },
    physics: {
      gravity: 150, // Falls faster
      damping: 0.88,
      mass: 2,
      bounce: 0.1,
      stickiness: 0.7, // Hard to remove
      clumpSize: 8, // Larger chunks
      spread: 12,
    },
    tools: {
      scrubEffective: false,
      hoseEffective: true,
    },
    removal: {
      fadeOut: false,
      fadeTime: 0,
      flyLifespan: 2.5, // Shorter lifespan
      removalForce: 80,
    },
    spawnWeight: 1,
    layerPriority: 2, // Middle layer
  },

  [DirtType.GREASE]: {
    type: DirtType.GREASE,
    visual: {
      color: 0x2f4f2f, // Dark slate gray
      alpha: 0.7,
      minSize: 2,
      maxSize: 8,
      shape: "square", // Flat patches
    },
    physics: {
      gravity: 80, // Lighter
      damping: 0.98, // Very sticky movement
      mass: 0.5,
      bounce: 0.05,
      stickiness: 0.5,
      clumpSize: 1, // Individual patches
      spread: 15, // Spread out flat
    },
    tools: {
      scrubEffective: true,
      hoseEffective: false,
    },
    removal: {
      fadeOut: true, // Grease dissolves under brush
      fadeTime: 0.8,
      flyLifespan: 0.5, // Very short if it does fly
      removalForce: 30,
    },
    spawnWeight: 1,
    layerPriority: 3, // Top layer
  },
};
