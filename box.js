class Box {
    constructor(x,y,t,l){
        // represents is left hand or right
        this.l = l;
        // represents the gesture
        this.bType = t;
        // the width of the box
        this.w = 50;
        this.scored = false; 
        this.shrinking = false;
        this.emojiSize = 48;
        this.particleAdded = false;

        this.body = Bodies.circle(x, y, this.w, { friction: 0, frictionAir: 0 });
        this.v = 1;
        Body.setVelocity(this.body, { x: 0, y: this.v });
        Composite.add(engine.world, this.body);

    }

    // Function to get the appropriate emoji for the gesture
    getGestureEmoji(gesture) {
        const emojiMap = {
            "Closed_Fist": "👊",
            "Open_Palm": "🖐️",
            "Pointing_Up": "☝️",
            "Thumb_Down": "👎",
            "Thumb_Up": "👍",
            "Victory": "✌️",
            "ILoveYou": "🤟"
        };
        return emojiMap[gesture] || "❓"; // Return default emoji if gesture not found
    }

    shrink() {
        if (this.shrinking) {
            this.emojiSize *= 0.95;
            if (this.emojiSize < 5) {
                this.removeBody();
            }
        }
      }
    

    show() {
        let position = this.body.position;
        let angle = this.body.angle;

        rectMode(CENTER);
        push();
        fill(127);
        stroke(0);
        strokeWeight(0.5);
        translate(position.x, position.y);
        rotate(angle);

        // Flip the emoji horizontally if it's a right hand gesture
        if (!this.l) {
            scale(-1, 1); // Flip horizontally
        }
        ellipse(0, 0, this.r * 2);

        // Draw the emoji inside the circle
        textAlign(CENTER, CENTER);
        textSize(this.emojiSize); // Adjust text size for the emoji
        text(this.getGestureEmoji(this.bType), 0, 0);

        pop();
        this.shrink(); 

        // // Display gesture text above the box
        // push();
        // fill(0);  // set text color
        // textSize(16);  // set text size
        // textAlign(CENTER, CENTER);  // center the text
        // text(this.bType, position.x, position.y - this.w / 2 - 10);  // display the gesture name above the box
        // pop();
    }

    checkEdge() {
        return this.body.position.y > canvasH + this.w;
    }
    
    // This function removes a body from the Matter.js world.
    removeBody() {
        Composite.remove(engine.world, this.body);
    }

    checkLine() {
        if (this.body.position.y > canvasH * 0.75 - this.w / 2 &&
            this.body.position.y < canvasH * 0.75 + this.w / 2) {
            if (!this.particleAdded) {
                let i;
                for (i = 0; i < 10; i++){
                    particleSystem.addParticle(this.body.position.x, this.body.position.y); // Add particles on tap
                }
                this.particleAdded = true;
            }

          // update score when gesture matched
          if (this.scored == false) {
            score += 100; 
            this.scored = true;
          }

          return true;
        }
        return false;
    }
}


