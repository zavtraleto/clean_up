import { useState, useRef } from "react";
import GameCanvas, { GameCanvasRef } from "./game/GameCanvas";
import { TestCanvas } from "./game/TestCanvas";
import { HUD } from "./ui/HUD";
import { MainMenu } from "./ui/MainMenu";
import { LevelComplete } from "./ui/LevelComplete";

type GameScreen = "menu" | "playing" | "complete" | "test";

export default function App() {
  const [screen, setScreen] = useState<GameScreen>("menu");
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({});
  const gameRef = useRef<GameCanvasRef>(null);

  const handleStartGame = () => {
    setScreen("playing");
    setProgress(0);
  };

  const handleComplete = () => {
    setScreen("complete");
  };

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress);
    // Update stats
    if (gameRef.current) {
      setStats(gameRef.current.getStats());
    }
  };

  const handleToggleHose = (on: boolean) => {
    gameRef.current?.toggleHose(on);
  };

  const handleResetDirt = () => {
    gameRef.current?.resetDirt();
    setProgress(0); // Reset progress when dirt is reset
  };

  const handleRestart = () => {
    setScreen("playing");
    setProgress(0);
    // Force remount of GameCanvas by changing key
    window.location.reload();
  };

  const handleMainMenu = () => {
    setScreen("menu");
    setProgress(0);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#0b0b0d",
        overflow: "hidden",
      }}
    >
      {screen === "test" && <TestCanvas />}

      {screen === "menu" && <MainMenu onStartGame={handleStartGame} />}

      {screen === "playing" && (
        <>
          <GameCanvas
            ref={gameRef}
            onComplete={handleComplete}
            onProgressUpdate={handleProgressUpdate}
          />
          <HUD
            onToggleHose={handleToggleHose}
            onResetDirt={handleResetDirt}
            progress={progress}
            stats={stats}
          />
        </>
      )}

      {screen === "complete" && (
        <LevelComplete
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
          progress={progress}
        />
      )}
    </div>
  );
}
