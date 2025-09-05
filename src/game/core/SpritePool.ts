import { Graphics } from "pixi.js";

export class SpritePool {
  private pool: Graphics[] = [];
  private used: Graphics[] = [];

  constructor(private capacity: number) {
    for (let i = 0; i < capacity; i++) {
      const sprite = new Graphics();
      this.pool.push(sprite);
    }
  }

  acquire(): Graphics | null {
    const sprite = this.pool.pop();
    if (!sprite) return null;

    sprite.clear();
    this.used.push(sprite);
    return sprite;
  }

  release(sprite: Graphics) {
    const index = this.used.indexOf(sprite);
    if (index >= 0) {
      this.used.splice(index, 1);
      sprite.clear();
      sprite.visible = false;
      this.pool.push(sprite);
    }
  }

  releaseAll() {
    for (const sprite of this.used) {
      sprite.clear();
      sprite.visible = false;
      this.pool.push(sprite);
    }
    this.used.length = 0;
  }

  get activeCount() {
    return this.used.length;
  }
}
