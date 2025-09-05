import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Engine } from "./Engine";
import type { LevelConfig, ToolsConfig, GameEvents } from "./types";

// Dynamic level config based on viewport
const createLevel = (): LevelConfig => ({
  id: "cleaning_object",
  image: "", // No background image needed
  width: window.innerWidth,
  height: window.innerHeight,
  threshold: 0.95,
  dirtLayers: [
    { density: 1.5, stickiness: 0.3, sizeRange: [1, 3] }, // Fine dirt particles
    { density: 1.2, stickiness: 0.5, sizeRange: [2, 4] }, // Medium dirt
    { density: 0.8, stickiness: 0.7, sizeRange: [3, 6] }, // Larger chunks
    { density: 0.4, stickiness: 0.8, sizeRange: [4, 8] }, // Big clumps
  ],
});

const tools: ToolsConfig = {
  scrub: { radius: 64, loosenChance: 0.35, baseKick: 30 },
  hose: { angleDeg: 25, range: 380, force: 40 },
};

export interface GameCanvasRef {
  toggleHose: (on: boolean) => void;
  getStats: () => any;
}

interface GameCanvasProps {
  onComplete?: () => void;
  onProgressUpdate?: (progress: number) => void;
}

const GameCanvas = forwardRef<GameCanvasRef, GameCanvasProps>(
  ({ onComplete, onProgressUpdate }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Engine | null>(null);

    useImperativeHandle(ref, () => ({
      toggleHose: (on: boolean) => {
        engineRef.current?.toggleHose(on);
      },
      getStats: () => {
        return engineRef.current?.getStats() || {};
      },
    }));

    useEffect(() => {
      if (!canvasRef.current) return;

      console.log("GameCanvas: useEffect triggered");

      // Prevent double initialization
      if (engineRef.current) {
        console.log("GameCanvas: Engine already exists, skipping init");
        return;
      }

      const engine = new Engine();
      engineRef.current = engine;

      const events: GameEvents = {
        onComplete: onComplete || (() => {}),
        onProgressUpdate: onProgressUpdate || (() => {}),
      };

      engine
        .init(canvasRef.current, createLevel(), tools, events)
        .catch((error) => {
          console.error("GameCanvas: Engine initialization failed:", error);
        });

      return () => {
        console.log("GameCanvas: Cleanup triggered");
        if (engineRef.current) {
          engineRef.current.destroy();
          engineRef.current = null;
        }
      };
    }, []);

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#0b0b0d",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            touchAction: "none",
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      </div>
    );
  }
);

GameCanvas.displayName = "GameCanvas";

export default GameCanvas;
