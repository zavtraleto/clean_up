import { Application, Graphics } from "pixi.js";

export class TestEngine {
  app!: Application;

  async init(canvas: HTMLCanvasElement) {
    console.log("TestEngine: Starting initialization...");
    console.log("Canvas element:", canvas);

    try {
      this.app = new Application();
      console.log("TestEngine: Application created");

      await this.app.init({
        canvas: canvas,
        width: 800,
        height: 600,
        antialias: true,
        backgroundAlpha: 1,
        backgroundColor: 0x1099bb,
      });

      console.log("TestEngine: PixiJS initialized", this.app);

      // Add a simple test graphic
      const graphics = new Graphics();
      graphics.rect(100, 100, 200, 200);
      graphics.fill(0xff0000);
      this.app.stage.addChild(graphics);

      console.log("TestEngine: Test graphic added");
    } catch (error) {
      console.error("TestEngine: Initialization failed:", error);
      throw error;
    }
  }

  destroy() {
    if (this.app) {
      this.app.destroy();
    }
  }
}
