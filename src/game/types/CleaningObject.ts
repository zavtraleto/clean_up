export interface CleaningObjectConfig {
  id: string;
  name: string;
  image: string;
  aspectRatio: number; // width/height ratio
  baseSize: number; // base size in pixels for smallest screen
  difficulty: number; // 0-1, how hard to clean
  depth: number; // visual depth of the card
  edgeColor: number; // color of the metallic edge
  specialMechanics?: {
    // Future expansion for special cleaning mechanics
    requiresSpecialTool?: boolean;
    hasLayers?: boolean;
    customPhysics?: boolean;
  };
}

export const CLEANING_OBJECTS: Record<string, CleaningObjectConfig> = {
  vintage_photo: {
    id: "vintage_photo",
    name: "Vintage Photo",
    image: "/assets/images/vintage_photo_placeholder.png",
    aspectRatio: 1.4, // 7:5 photo ratio
    baseSize: 320,
    difficulty: 0.6,
    depth: 8,
    edgeColor: 0xc0c0c0, // Silver metallic
  },
  business_card: {
    id: "business_card",
    name: "Business Card",
    image: "/assets/images/business_card_placeholder.png",
    aspectRatio: 1.75, // Standard business card ratio
    baseSize: 280,
    difficulty: 0.3,
    depth: 4,
    edgeColor: 0xffd700, // Gold metallic
  },
  trading_card: {
    id: "trading_card",
    name: "Trading Card",
    image: "/assets/images/trading_card_placeholder.png",
    aspectRatio: 0.7, // Standard trading card ratio
    baseSize: 300,
    difficulty: 0.8,
    depth: 6,
    edgeColor: 0x4a4a4a, // Dark metallic
  },
};

export function getObjectSizeForScreen(
  baseSize: number,
  screenWidth: number
): number {
  if (screenWidth >= 1080) return Math.max(baseSize * 2.8, 900);
  if (screenWidth >= 900) return Math.max(baseSize * 1.6, 450);
  return Math.max(baseSize * 1.2, 380);
}
