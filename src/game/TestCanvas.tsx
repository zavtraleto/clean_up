import { useEffect, useRef } from "react";
import { TestEngine } from "./TestEngine";

export function TestCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    console.log("TestCanvas: Effect running");
    const engine = new TestEngine();

    engine.init(canvasRef.current).catch((error) => {
      console.error("TestCanvas: Engine initialization failed:", error);
    });

    return () => {
      console.log("TestCanvas: Cleanup");
      engine.destroy();
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#222",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          border: "2px solid #fff",
          display: "block",
        }}
      />
    </div>
  );
}
