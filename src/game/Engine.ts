import { Application, Container, Graphics, Sprite, Assets } from "pixi.js";
import { ParticlePool } from "./core/ParticlePool";
import { SpatialHash } from "./core/SpatialHash";
import { CoverageMap } from "./core/CoverageMap";
import { SpritePool } from "./core/SpritePool";
import { DirtSystem } from "./systems/DirtSystem";
import { ScrubSystem } from "./systems/ScrubSystem";
import { HoseSystem } from "./systems/HoseSystem";
import { PhysicsSystem } from "./systems/PhysicsSystem";
import { ProgressSystem } from "./systems/ProgressSystem";
import { EffectsSystem } from "./systems/EffectsSystem";
import { Particle } from "./core/Particle";
import { LevelConfig, ToolsConfig, ParticleState, GameEvents } from "./types";

export class Engine {
  app!: Application;
  stage!: Container;
  particlesLayer!: Container;
  hoseLayer!: Container;
  imageSprite!: Sprite;

  // Central cleaning object
  objectContainer!: Container;
  objectGraphics!: Graphics;
  objectTextureSprite!: Sprite;
  objectBounds!: { x: number; y: number; width: number; height: number };

  pool = new ParticlePool(8000);
  spritePool = new SpritePool(8000);
  hash = new SpatialHash(32);
  cov!: CoverageMap;

  dirt!: DirtSystem;
  scrub!: ScrubSystem;
  hose!: HoseSystem;
  phys!: PhysicsSystem;
  prog!: ProgressSystem;
  effects!: EffectsSystem;

  tools!: ToolsConfig;
  usingHose = false;
  nozzle = { x: 0, y: 0 };
  pointer = { x: 0, y: 0 };

  private lastProgress = 0;
  private completionTriggered = false;
  private events?: GameEvents;

  async init(
    canvas: HTMLCanvasElement,
    level: LevelConfig,
    tools: ToolsConfig,
    events?: GameEvents
  ) {
    try {
      console.log("Engine init starting...", { level, tools });
      console.log(
        "Canvas element:",
        canvas,
        "dimensions:",
        canvas.width,
        "x",
        canvas.height
      );
      this.tools = tools;
      this.events = events;
      this.completionTriggered = false;

      this.app = new Application();

      // Explicitly set canvas size
      canvas.width = level.width;
      canvas.height = level.height;

      await this.app.init({
        canvas,
        width: level.width,
        height: level.height,
        antialias: true,
        background: 0xf5f5f5, // Light gray background
      });

      console.log("PixiJS app initialized", this.app);

      this.stage = this.app.stage;
      this.particlesLayer = new Container();
      this.hoseLayer = new Container();

      // Simple resize handling
      window.addEventListener("resize", () => {
        // Let CSS handle the display scaling
      });

      // Create central object (1/4 of canvas size)
      this.objectBounds = {
        width: level.width / 4,
        height: level.height / 4,
        x: level.width / 2 - level.width / 8,
        y: level.height / 2 - level.height / 8,
      };

      // Create object container for 3D transforms
      this.objectContainer = new Container();
      this.objectContainer.x = level.width / 2;
      this.objectContainer.y = level.height / 2;

      // Create background graphics (for fallback)
      this.objectGraphics = new Graphics();
      this.objectGraphics.rect(
        -this.objectBounds.width / 2,
        -this.objectBounds.height / 2,
        this.objectBounds.width,
        this.objectBounds.height
      );
      this.objectGraphics.fill(0xf0f0f0); // Light background for the card
      this.objectContainer.addChild(this.objectGraphics);

      // Load and add texture image
      try {
        // Use the existing poster image from assets
        const imageUrl = "/assets/images/poster_001.svg";
        const texture = await Assets.load(imageUrl);

        this.objectTextureSprite = new Sprite(texture);

        // Scale image to fit the object bounds
        const scaleX = this.objectBounds.width / this.objectTextureSprite.width;
        const scaleY =
          this.objectBounds.height / this.objectTextureSprite.height;
        const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

        this.objectTextureSprite.scale.set(scale);
        this.objectTextureSprite.anchor.set(0.5); // Center the image
        this.objectTextureSprite.x = 0;
        this.objectTextureSprite.y = 0;

        this.objectContainer.addChild(this.objectTextureSprite);
        console.log("Object texture loaded successfully");
      } catch (error) {
        console.warn(
          "Failed to load object texture, using solid color fallback:",
          error
        );
        // Fallback to solid color if image loading fails
        this.objectGraphics.fill(0x8b5a2b);
      }

      // Create a dummy sprite for the imageSprite reference (not used anymore)
      this.imageSprite = new Sprite();
      this.imageSprite.alpha = 1;

      this.stage.addChild(this.objectContainer);
      this.stage.addChild(this.particlesLayer);
      this.stage.addChild(this.hoseLayer);

      // Position particles layer to match object container (for 3D transforms)
      this.particlesLayer.x = level.width / 2;
      this.particlesLayer.y = level.height / 2;

      // Initialize systems
      this.cov = new CoverageMap(level.width, level.height, 16);
      this.dirt = new DirtSystem(this.pool, this.cov);
      this.scrub = new ScrubSystem(this.hash, this.cov);
      this.hose = new HoseSystem(this.hash, this.cov);
      this.phys = new PhysicsSystem(level.width, level.height);
      this.prog = new ProgressSystem(this.cov);
      this.effects = new EffectsSystem();
      this.effects.setShakeContainer(this.stage);

      // Spawn dirt only within object bounds
      this.dirt.spawn(level, this.objectBounds);
      console.log("Dirt spawned, particles:", this.pool.activeCount);

      // Set nozzle position (bottom center for better coverage)
      this.nozzle.x = level.width / 2;
      this.nozzle.y = level.height - 30;

      // Setup input
      this.setupInput();

      // Start update loop
      this.app.ticker.add(this.update);
      console.log("Engine initialization complete");
    } catch (error) {
      console.error("Engine initialization failed:", error);
      throw error;
    }
  }

  private setupInput() {
    this.stage.eventMode = "static";
    this.stage.hitArea = this.app.screen;

    this.stage.on("pointermove", (e: any) => {
      const p = e.global;
      this.pointer.x = p.x;
      this.pointer.y = p.y;
    });

    this.stage.on("pointerdown", () => {
      // Could add touch feedback here
    });
  }

  toggleHose(on: boolean) {
    this.usingHose = on;
  }

  // Spring animation properties
  private currentRotX = 0;
  private currentRotY = 0;
  private targetRotX = 0;
  private targetRotY = 0;

  private updateObjectTilt() {
    // Calculate distance from cursor to object center
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    const deltaX = this.pointer.x - centerX;
    const deltaY = this.pointer.y - centerY;

    // Calculate distance from center
    const distanceFromCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Define influence radius (larger area for more responsive effect)
    const maxInfluenceRadius =
      Math.min(this.app.screen.width, this.app.screen.height) * 0.8;

    // Calculate influence strength based on distance (closer = stronger attraction)
    const influenceStrength = Math.max(
      0,
      1 - distanceFromCenter / maxInfluenceRadius
    );

    if (influenceStrength > 0) {
      // Calculate target rotation based on cursor position with gravity-like attraction
      // Normalize relative to influence radius for consistent rotation
      const normalizedX = deltaX / maxInfluenceRadius;
      const normalizedY = deltaY / maxInfluenceRadius;

      // Calculate target rotation angles - much more visible effect
      const maxTiltDegrees = 35; // Increased from 20 to 35 degrees for more dramatic effect
      const effectiveMaxTilt = maxTiltDegrees * influenceStrength;

      // The object "leans" toward the cursor like it's being attracted
      this.targetRotX = normalizedY * effectiveMaxTilt * 1.2; // Up/down (amplified)
      this.targetRotY = normalizedX * effectiveMaxTilt * 1.2; // Left/right (amplified)

      // Clamp to effective max tilt
      this.targetRotX = Math.max(
        -effectiveMaxTilt,
        Math.min(effectiveMaxTilt, this.targetRotX)
      );
      this.targetRotY = Math.max(
        -effectiveMaxTilt,
        Math.min(effectiveMaxTilt, this.targetRotY)
      );
    } else {
      // When cursor is too far away, return to center (0, 0)
      this.targetRotX = 0;
      this.targetRotY = 0;
    }

    // Apply spring animation to smoothly reach target rotation
    this.updateSpringAnimation();

    // Apply the current rotation
    this.apply3DRotation(this.currentRotX, this.currentRotY);
  }

  private updateSpringAnimation() {
    // Spring physics constants - more responsive for gravity effect
    const springStiffness = 0.12; // How quickly it moves toward target
    const springDamping = 0.85; // How much it bounces/oscillates

    // Calculate spring forces
    const forceX = (this.targetRotX - this.currentRotX) * springStiffness;
    const forceY = (this.targetRotY - this.currentRotY) * springStiffness;

    // Apply forces with damping
    this.currentRotX += forceX;
    this.currentRotY += forceY;

    // Apply damping to prevent oscillation
    this.currentRotX *= springDamping;
    this.currentRotY *= springDamping;

    // Snap to target when very close (prevents infinite tiny movements)
    if (Math.abs(this.targetRotX - this.currentRotX) < 0.05) {
      this.currentRotX = this.targetRotX;
    }
    if (Math.abs(this.targetRotY - this.currentRotY) < 0.05) {
      this.currentRotY = this.targetRotY;
    }
  }

  private apply3DRotation(rotateX: number, rotateY: number) {
    // Convert degrees to radians
    const rotXRad = (rotateX * Math.PI) / 180;
    const rotYRad = (rotateY * Math.PI) / 180;

    // Calculate 3D rotation matrix components
    const cosX = Math.cos(rotXRad);
    const cosY = Math.cos(rotYRad);
    const sinY = Math.sin(rotYRad);

    // Pure 3D rotation without skewing - like CSS rotateX/rotateY
    // Only apply perspective foreshortening (scaling) and Z-rotation

    // Perspective foreshortening (objects appear smaller when tilted away)
    const scaleX = Math.abs(cosY); // Y rotation affects X scale
    const scaleY = Math.abs(cosX); // X rotation affects Y scale

    // Apply clean 3D transform without skewing
    this.objectContainer.scale.x = scaleX;
    this.objectContainer.scale.y = scaleY;

    // Remove skewing completely for clean rotation
    this.objectContainer.skew.x = 0;
    this.objectContainer.skew.y = 0;

    // Pure Z-rotation based on Y-axis rotation (like a card turning)
    this.objectContainer.rotation = sinY * 0.3;

    // Keep object perfectly centered (rotate around center)
    this.objectContainer.x = this.app.screen.width / 2;
    this.objectContainer.y = this.app.screen.height / 2;

    // Apply the SAME transforms to particles layer so dirt rotates with object
    this.particlesLayer.scale.x = scaleX;
    this.particlesLayer.scale.y = scaleY;
    this.particlesLayer.skew.x = 0;
    this.particlesLayer.skew.y = 0;
    this.particlesLayer.rotation = sinY * 0.3;
    this.particlesLayer.x = this.app.screen.width / 2;
    this.particlesLayer.y = this.app.screen.height / 2;
  }

  private worldToObjectCoords(
    worldX: number,
    worldY: number
  ): { x: number; y: number } {
    // Convert from world coordinates to object-relative coordinates
    // taking into account the current 3D transforms

    // First, translate to object center
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;
    const relX = worldX - centerX;
    const relY = worldY - centerY;

    // Apply inverse transforms to get back to object space
    const rotXRad = (this.currentRotX * Math.PI) / 180;
    const rotYRad = (this.currentRotY * Math.PI) / 180;

    const cosX = Math.cos(rotXRad);
    const cosY = Math.cos(rotYRad);
    const sinY = Math.sin(rotYRad);

    const scaleX = Math.abs(cosY);
    const scaleY = Math.abs(cosX);
    const rotationZ = sinY * 0.3;

    // Reverse the transforms
    let objX = relX / scaleX;
    let objY = relY / scaleY;

    // Reverse rotation
    if (rotationZ !== 0) {
      const cos = Math.cos(-rotationZ);
      const sin = Math.sin(-rotationZ);
      const newX = objX * cos - objY * sin;
      const newY = objX * sin + objY * cos;
      objX = newX;
      objY = newY;
    }

    return { x: objX, y: objY };
  }

  private update = (ticker: any) => {
    const dt = Math.min(0.05, Math.max(0.016, ticker.deltaTime / 60));

    // Rebuild spatial hash
    this.hash.clear();
    this.pool.forEach((p) => {
      if (!p.alive) return;
      this.hash.insert(p);
    });

    // Apply input interactions
    if (this.usingHose) {
      // Convert world coordinates to object-relative coordinates for cleaning
      const nozzleObj = this.worldToObjectCoords(this.nozzle.x, this.nozzle.y);
      const pointerObj = this.worldToObjectCoords(
        this.pointer.x,
        this.pointer.y
      );

      this.hose.update(
        nozzleObj.x,
        nozzleObj.y,
        pointerObj.x,
        pointerObj.y,
        this.tools.hose.angleDeg,
        this.tools.hose.range,
        this.tools.hose.force
      );
    } else {
      // Convert world coordinates to object-relative coordinates for cleaning
      const pointerObj = this.worldToObjectCoords(
        this.pointer.x,
        this.pointer.y
      );

      this.scrub.update(
        pointerObj.x,
        pointerObj.y,
        performance.now() / 1000,
        this.tools.scrub.radius,
        this.tools.scrub.loosenChance,
        this.tools.scrub.baseKick
      );
    }

    // Update object tilt based on cursor position
    this.updateObjectTilt();

    // Physics & cull dead particles
    const toRemove: Particle[] = [];
    this.pool.forEach((p) => {
      if (!p.alive) return;
      this.phys.integrate(p, dt);
      if (!p.alive) toRemove.push(p);
    });

    // Remove dead particles from pool
    for (const p of toRemove) {
      this.pool.release(p);
    }

    // Render particles
    this.renderParticles();

    // Render hose effect
    this.renderHose();

    // Progress & completion
    const progress = this.prog.getProgress();
    this.imageSprite.alpha = progress; // Simple reveal

    // Notify progress updates
    if (Math.abs(progress - this.lastProgress) > 0.01) {
      this.events?.onProgressUpdate(progress);
      this.lastProgress = progress;
    }

    // Check for completion
    if (progress >= 0.95 && !this.completionTriggered) {
      this.completionTriggered = true;
      this.effects.finale(() => {
        this.events?.onComplete();
      });
    }
  };

  private renderParticles() {
    // Release all sprites back to pool
    this.spritePool.releaseAll();

    let count = 0;
    this.pool.forEach((p) => {
      if (!p.alive) return;
      count++;

      const sprite = this.spritePool.acquire();
      if (!sprite) return; // Pool exhausted

      // Different colors based on size and state for realistic dirt
      let color: number;
      if (p.state === ParticleState.STUCK) {
        // Stuck dirt - darker, varies by size
        if (p.size <= 2) color = 0x2d2419; // Fine dark dirt
        else if (p.size <= 4) color = 0x372b22; // Medium brown dirt
        else color = 0x1a1511; // Large dark clumps
      } else {
        // Loose dirt - slightly lighter when disturbed
        if (p.size <= 2) color = 0x3d332a; // Fine loose dirt
        else if (p.size <= 4) color = 0x4a3b2f; // Medium loose dirt
        else color = 0x2a211a; // Large loose clumps
      }

      sprite.circle(p.x, p.y, p.size / 2).fill(color);
      sprite.visible = true;

      // Add to stage if not already added
      if (!sprite.parent) {
        this.particlesLayer.addChild(sprite);
      }
    });

    // Debug: log particle count occasionally
    if (Math.random() < 0.01) {
      console.log("Rendering particles:", count);
    }
  }
  destroy() {
    if (this.app && this.app.ticker) {
      this.app.ticker.remove(this.update);
    }
    if (this.dirt) {
      this.dirt.cleanup();
    }
    if (this.effects) {
      this.effects.reset();
    }
    if (this.app) {
      this.app.destroy();
    }
  }

  private renderHose() {
    // Clear previous hose graphics
    this.hoseLayer.removeChildren();

    if (!this.usingHose) return;

    // Draw water stream from nozzle to pointer
    const graphics = new Graphics();

    // Calculate direction and distance
    const dx = this.pointer.x - this.nozzle.x;
    const dy = this.pointer.y - this.nozzle.y;
    const distance = Math.hypot(dx, dy);
    const maxRange = this.tools.hose.range;

    if (distance > maxRange) {
      // Limit to max range
      const scale = maxRange / distance;
      const endX = this.nozzle.x + dx * scale;
      const endY = this.nozzle.y + dy * scale;

      // Draw water stream
      graphics.moveTo(this.nozzle.x, this.nozzle.y);
      graphics.lineTo(endX, endY);
      graphics.stroke({ width: 8, color: 0x87ceeb, alpha: 0.6 });

      // Draw water cone at the end
      const coneRadius = 20;
      graphics.circle(endX, endY, coneRadius);
      graphics.fill({ color: 0x87ceeb, alpha: 0.3 });
    } else {
      // Draw to pointer position
      graphics.moveTo(this.nozzle.x, this.nozzle.y);
      graphics.lineTo(this.pointer.x, this.pointer.y);
      graphics.stroke({ width: 8, color: 0x87ceeb, alpha: 0.6 });

      // Draw water cone at pointer
      const coneRadius = 20;
      graphics.circle(this.pointer.x, this.pointer.y, coneRadius);
      graphics.fill({ color: 0x87ceeb, alpha: 0.3 });
    }

    this.hoseLayer.addChild(graphics);
  }

  // Debug methods
  getStats() {
    return {
      particles: this.pool.activeCount,
      progress: this.prog.getProgress(),
      usingHose: this.usingHose,
    };
  }
}
