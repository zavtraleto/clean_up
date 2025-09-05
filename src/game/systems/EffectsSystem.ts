import { Container } from "pixi.js";

export class EffectsSystem {
  private shakeContainer: Container | null = null;
  private isShaking = false;
  private finaleTriggered = false;

  setShakeContainer(container: Container) {
    this.shakeContainer = container;
  }

  microShake(power: number) {
    if (!this.shakeContainer || this.isShaking) return;

    this.isShaking = true;
    const originalX = this.shakeContainer.x;
    const originalY = this.shakeContainer.y;

    // Simple shake animation
    const shakeAmount = power * 5;
    let frames = 0;
    const maxFrames = 10;

    const shake = () => {
      if (frames < maxFrames && this.shakeContainer) {
        this.shakeContainer.x = originalX + (Math.random() - 0.5) * shakeAmount;
        this.shakeContainer.y = originalY + (Math.random() - 0.5) * shakeAmount;
        frames++;
        requestAnimationFrame(shake);
      } else if (this.shakeContainer) {
        this.shakeContainer.x = originalX;
        this.shakeContainer.y = originalY;
        this.isShaking = false;
      }
    };

    shake();
  }

  finale(onComplete?: () => void) {
    if (this.finaleTriggered) return;
    this.finaleTriggered = true;

    // Camera punch-in effect
    if (this.shakeContainer) {
      const originalScale = this.shakeContainer.scale.x;
      let scale = originalScale;
      let frames = 0;
      const maxFrames = 30;

      const punchIn = () => {
        if (frames < maxFrames && this.shakeContainer) {
          scale =
            originalScale + Math.sin((frames / maxFrames) * Math.PI) * 0.1;
          this.shakeContainer.scale.set(scale);
          frames++;
          requestAnimationFrame(punchIn);
        } else if (this.shakeContainer) {
          this.shakeContainer.scale.set(originalScale);
          // Trigger big shake
          this.microShake(2);
          onComplete?.();
        }
      };

      punchIn();
    } else {
      onComplete?.();
    }
  }

  reset() {
    this.finaleTriggered = false;
    this.isShaking = false;
  }
}
