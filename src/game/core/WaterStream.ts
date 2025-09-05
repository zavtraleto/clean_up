export class WaterStream {
  private segments: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    targetX: number;
    targetY: number;
  }[] = [];
  private segmentCount = 10;
  private springStiffness = 0.15;
  private damping = 0.85;

  constructor(startX: number, startY: number, endX: number, endY: number) {
    this.initializeSegments(startX, startY, endX, endY);
  }

  private initializeSegments(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) {
    this.segments = [];

    for (let i = 0; i < this.segmentCount; i++) {
      const t = i / (this.segmentCount - 1);
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;

      this.segments.push({
        x,
        y,
        vx: 0,
        vy: 0,
        targetX: x,
        targetY: y,
      });
    }
  }

  update(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    deltaTime: number
  ) {
    // Update target positions for each segment
    for (let i = 0; i < this.segments.length; i++) {
      const t = i / (this.segments.length - 1);
      this.segments[i].targetX = startX + (endX - startX) * t;
      this.segments[i].targetY = startY + (endY - startY) * t;
    }

    // Apply spring physics with wave propagation delay
    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];

      // Calculate spring force towards target position
      const deltaX = segment.targetX - segment.x;
      const deltaY = segment.targetY - segment.y;

      // Add spring acceleration
      segment.vx += deltaX * this.springStiffness;
      segment.vy += deltaY * this.springStiffness;

      // Apply damping
      segment.vx *= this.damping;
      segment.vy *= this.damping;

      // Update position
      segment.x += segment.vx * deltaTime * 60; // Normalize for 60fps
      segment.y += segment.vy * deltaTime * 60;

      // Add influence from previous segment for wave propagation
      if (i > 0) {
        const prevSegment = this.segments[i - 1];
        const influenceStrength = 0.3;
        const influenceX = (prevSegment.x - segment.x) * influenceStrength;
        const influenceY = (prevSegment.y - segment.y) * influenceStrength;

        segment.vx += influenceX * deltaTime * 60;
        segment.vy += influenceY * deltaTime * 60;
      }
    }
  }

  getSegments(): { x: number; y: number }[] {
    return this.segments.map((s) => ({ x: s.x, y: s.y }));
  }

  // Get effective cleaning position (where the water hits)
  getImpactPoint(): { x: number; y: number } {
    const lastSegment = this.segments[this.segments.length - 1];
    return { x: lastSegment.x, y: lastSegment.y };
  }
}
