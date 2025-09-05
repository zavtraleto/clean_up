interface LevelCompleteProps {
  onRestart: () => void;
  onMainMenu: () => void;
  progress: number;
}

export function LevelComplete({
  onRestart,
  onMainMenu,
  progress,
}: LevelCompleteProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
          padding: "40px",
          borderRadius: "20px",
          textAlign: "center",
          maxWidth: "400px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            fontSize: "4rem",
            marginBottom: "20px",
          }}
        >
          ✨
        </div>

        <h2
          style={{
            fontSize: "2.5rem",
            marginBottom: "10px",
            fontWeight: "bold",
          }}
        >
          Level Complete!
        </h2>

        <p
          style={{
            fontSize: "1.2rem",
            marginBottom: "20px",
            opacity: 0.9,
          }}
        >
          You cleaned {Math.round(progress * 100)}% of the surface!
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.2)",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "30px",
          }}
        >
          <p
            style={{
              fontSize: "1.1rem",
              margin: 0,
            }}
          >
            🎉 Perfect cleaning job! The surface is sparkling clean.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={onRestart}
            style={{
              padding: "12px 24px",
              fontSize: "1rem",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "2px solid rgba(255,255,255,0.3)",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            }}
          >
            🔄 Play Again
          </button>

          <button
            onClick={onMainMenu}
            style={{
              padding: "12px 24px",
              fontSize: "1rem",
              background: "white",
              color: "#22c55e",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "transform 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            🏠 Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
