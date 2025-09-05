import { Particle } from "./Particle";

export class ParticlePool {
  private pool: Particle[] = [];
  private used: Particle[] = [];

  constructor(private capacity: number) {
    for (let i = 0; i < capacity; i++) {
      this.pool.push(new Particle());
    }
  }

  acquire(): Particle | null {
    const p = this.pool.pop();
    if (!p) return null;
    this.used.push(p);
    return p;
  }

  release(p: Particle) {
    p.alive = false;
    const index = this.used.indexOf(p);
    if (index >= 0) {
      this.used.splice(index, 1);
      this.pool.push(p);
    }
  }

  forEach(cb: (p: Particle) => void) {
    for (let i = 0; i < this.used.length; i++) {
      const p = this.used[i];
      if (p.alive) cb(p);
    }
  }

  get activeCount() {
    return this.used.length;
  }
}
