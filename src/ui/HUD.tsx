import { useState } from "react";

interface HUDProps {
  onToggleHose: (on: boolean) => void;
  onResetDirt?: () => void;
  progress: number;
  stats?: any;
}

export function HUD({ onToggleHose, onResetDirt, progress, stats }: HUDProps) {
  const [hose, setHose] = useState(false);

  const handleToggleHose = () => {
    const newState = !hose;
    setHose(newState);
    onToggleHose(newState);
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Progress Bar */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            padding: "8px 12px",
            borderRadius: "8px",
            color: "white",
            fontSize: "14px",
          }}
        >
          <div>Progress: {Math.round(progress * 100)}%</div>
          <div
            style={{
              width: "100%",
              height: "4px",
              background: "rgba(255,255,255,0.3)",
              borderRadius: "2px",
              marginTop: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                background: "#4ade80",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tools */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <button
          onClick={handleToggleHose}
          style={{
            padding: "12px 20px",
            background: hose ? "#3b82f6" : "rgba(0,0,0,0.5)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            minWidth: "100px",
            transition: "background 0.2s ease",
          }}
        >
          {hose ? "🚿 Hose ON" : "✋ Scrub"}
        </button>

        {/* Reset Dirt Button for debugging */}
        {onResetDirt && (
          <button
            onClick={onResetDirt}
            style={{
              padding: "8px 16px",
              background: "rgba(255, 165, 0, 0.8)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
              minWidth: "100px",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 165, 0, 1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 165, 0, 0.8)";
            }}
          >
            🔄 Reset Dirt
          </button>
        )}
      </div>

      {/* Debug Info */}
      {stats && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            background: "rgba(0,0,0,0.5)",
            padding: "8px",
            borderRadius: "4px",
            color: "white",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          <div>Particles: {stats.particles}</div>
          <div>Mode: {stats.usingHose ? "Hose" : "Scrub"}</div>
        </div>
      )}
    </div>
  );
}
