interface MainMenuProps {
  onStartGame: () => void;
}

export function MainMenu({ onStartGame }: MainMenuProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "400px",
          padding: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "1rem",
            fontWeight: "bold",
          }}
        >
          🧽 Wash Simulator
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            marginBottom: "2rem",
            opacity: 0.9,
          }}
        >
          Clean the surface by scrubbing away dirt particles!
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "2rem",
            textAlign: "left",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>How to Play:</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              ✋ Drag to scrub and loosen dirt
            </li>
            <li style={{ marginBottom: "8px" }}>
              🚿 Use hose to wash away loose particles
            </li>
            <li style={{ marginBottom: "8px" }}>
              🎯 Clean 95% to complete the level
            </li>
          </ul>
        </div>

        <button
          onClick={onStartGame}
          style={{
            padding: "15px 30px",
            fontSize: "1.2rem",
            background: "#4ade80",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "transform 0.2s ease",
            boxShadow: "0 4px 15px rgba(74, 222, 128, 0.3)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Start Cleaning! 🧹
        </button>
      </div>
    </div>
  );
}
