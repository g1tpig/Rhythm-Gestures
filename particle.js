class Particle {
    constructor(x, y) {
      this.pos = createVector(x, y);
      this.vel = p5.Vector.random2D().mult(random(0.5, 2));
      this.acc = createVector(0, 0.005); // Gravity-like effect
      this.lifetime = 600; // Particle lifetime
    }
  
    update() {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.lifetime -= 5; // Reduce lifetime over time
    }
  
    show() {
      noStroke();
      fill(255, this.lifetime); // Particle fades out
      ellipse(this.pos.x, this.pos.y, 8);
    }
  
    isFinished() {
      return this.lifetime <= 0;
    }
  }
  