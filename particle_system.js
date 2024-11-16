class ParticleSystem {
    constructor() {
      this.particles = [];
    }
  
    addParticle(x, y) {
      for (let i = 0; i < 5; i++) { // Create 10 particles per tap
        this.particles.push(new Particle(x, y));
      }
    }
  
    update() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        this.particles[i].update();
        this.particles[i].show();
        if (this.particles[i].isFinished()) {
          this.particles.splice(i, 1);
        }
      }
    }
  }
  
  