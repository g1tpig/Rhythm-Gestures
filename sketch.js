let gestures_results;
let cam = null;
let p5canvas = null;
let song;
let reverb;
let filter;
let isUnderwater = false;
let engine;
const { Engine, Bodies, Composite, Body, Vector, Render } = Matter;
let boxes = [];
let ground;
let timeToReachBottom;
let noteIndex = 0;
let startTime = 0;
let elapsedTime;
let offsetTime = 50;
let canvasW = 800;
let canvasH = 600;
let particleSystem;
let beatMapData;
let score = 0;
const gestures = ["Closed_Fist", "Open_Palm", "Pointing_Up", "Thumb_Down", "Thumb_Up", "Victory", "ILoveYou"];

function preload(){
  soundFormats('wav','mp3');
  song = loadSound('./libraries/assets/sound/song3/snoozy beats - altitude.mp3', () => {
    // song.onended(saveBeatMapData);
  });
  beatMapData = loadJSON('./beatmap.json');
}

function setup() {
  p5canvas = createCanvas(canvasW, canvasH);
  p5canvas.parent('#canvas');
  // p5canvas.style('width', '100%');
  // p5canvas.style('height', '100%');

  // set the frame rate
  frameRate(60);
  // To get the time we calculate the total time for how many frame needed
  let timeForEachFrame = deltaTime;
  timeToReachBottom = canvasH * 0.75 * timeForEachFrame;

  reverb = new p5.Reverb();
  filter = new p5.LowPass();
  filter.freq(500);

  engine = Engine.create();
  engine.gravity.y = 0;

  particleSystem = new ParticleSystem();
  
  // ground = Bodies.rectangle(width / 2, height - 5, 
  //   width, 10, { isStatic: true });
  // Composite.add(engine.world, ground);


  // When gestures are found, the following function is called. The detection results are stored in results.
  gotGestures = function (results) {
    gestures_results = results;
  }

}


function startWebcam() {
  // If the function setCameraStreamToMediaPipe is defined in the window object, the camera stream is set to MediaPipe.
  if (window.setCameraStreamToMediaPipe) {
    cam = createCapture(VIDEO);
    cam.hide();
    cam.elt.onloadedmetadata = function () {
      window.setCameraStreamToMediaPipe(cam.elt);
    }
    // p5canvas.style('width', '100%');
    // p5canvas.style('height', 'auto');
  }

  // After the user interacted with the game page, the music was played
  song.play();
  startTime = millis();

  
  
  
}

function underWater(){
  song.disconnect();
  song.connect(reverb);
  song.connect(filter);
  reverb.process(song, 3, 2);
  isUnderwater = true;
}

function restoreSound(){
  song.connect(); 
  isUnderwater = false; 
}


function draw() {
  background(127);
  // if (cam) {
  //   image(cam, 0, 0, canvasW, canvasH);
  // }

  if (cam) {
    // 设置摄像机视图的尺寸和位置
    const camWidth = 160;  // 摄像机视图宽度
    const camHeight = 120; // 摄像机视图高度
    const padding = 10;    // 与画布边缘的距离
    
    // 在右上角绘制摄像机画面
    image(cam, canvasW - camWidth - padding, padding, camWidth, camHeight);
    
    // 可选：给摄像机视图添加边框
    noFill();
    stroke(255);
    strokeWeight(2);
    rect(canvasW - camWidth - padding, padding, camWidth, camHeight);
  }

  let lineY = canvasH * 0.75; 
  stroke(0); 
  strokeWeight(4); 
  line(0, lineY, canvasW, lineY);
  strokeWeight(1);
  line(canvasW/2, 0, canvasW/2, lineY);

  if (startTime != 0) {
    elapsedTime = millis() - startTime;
  }

  Engine.update(engine);

  // Boxes fall from the top every 
  let realTime = timeToReachBottom + elapsedTime;
  if (noteIndex < beatMapData.notes.length) {
    let expectedTime = beatMapData.notes[noteIndex].position*1000;
    if (expectedTime <= realTime + offsetTime && expectedTime >= realTime - offsetTime) {
      let randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
      let randomBoolean = Math.random() < 0.5;
      let box;
      if (randomBoolean) {
        box = new Box(random(50,canvasW/2-50), 0, randomGesture, randomBoolean);
      } else{
        box = new Box(random(canvasW/2+50,canvasW-50), 0, randomGesture, randomBoolean);
      }
      console.log("New box created:", box); 
      boxes.push(box);
      noteIndex++;
    }
    // console.log(`Note ${noteIndex}: expectedTime = ${expectedTime}, realTime = ${realTime}`);
  }

  // let closestBox = null;
  // let minDistance = Infinity;
  // Iterate over the boxes backwards
  for (let i = boxes.length - 1; i >= 0; i--) {
    let boxY = boxes[i].body.position.y;

    // if (boxY < lineY) {
    //   let distance = lineY - boxY;

    //   if (distance < minDistance) {
    //     minDistance = distance;
    //     closestBox = boxes[i];
    //   }
    // }
    let distanceToLine = lineY - boxes[i].body.position.y; 
    let outerRadius = 100; 
    let innerRadius = 20; 
    // outer eclipse gets smaller
    if (distanceToLine < outerRadius * 2) {
      outerRadius = map(distanceToLine, 0, outerRadius * 2, innerRadius, outerRadius);
      noFill();
      stroke(255, 0, 0);
      strokeWeight(2);
      if (boxes[i].body.position.x < canvasW/2) {
        ellipse(200, lineY/2, outerRadius * 2);
        stroke(255);
        ellipse(200, lineY/2, innerRadius * 2); 
      } else{
        ellipse(600, lineY/2, outerRadius * 2);
        stroke(255);
        ellipse(600, lineY/2, innerRadius * 2); 
      }  
    } 

    if (boxes[i] instanceof Box) {
      boxes[i].show();
    } else {
      console.error("Invalid object in boxes array", boxes[i]);
    }
  
    // Remove the Body from the world and the array
    if (boxes[i].checkEdge()) {
      boxes[i].removeBody();
      boxes.splice(i, 1);
    }

    if (boxes[i].body.position.y > lineY) {
      boxes[i].shrinking = true;
    }

    // if(mouseIsPressed){
    //   // line is between upper bound and of the box
    //   if(boxes[i].checkLine()){}
    // }
    if (gestures_results && gestures_results.gestures.length>0){
      let gGest = gestures_results.gestures[0][0].categoryName;
      let gHand = gestures_results.handedness[0][0].categoryName;

      if (gHand == 'Left') {
        gHand = true;
      } else {
        gHand = false;
      }
      if(gGest == boxes[i].bType && gHand == boxes[i].l){
        boxes[i].checkLine();
      }
    }

    particleSystem.update(); // Update and display particles
  }
  
  
  // if (closestBox != null) {
    
  // }

  addNoteToBeatmap();
  // Display the score at the top-left corner of the canvas
  textSize(32);
  fill(255);
  text('Score: ' + score, 10, 40);

}

let mousePressStartTime = null; // Store when the mouse was pressed down
let isMouseHeld = false;

function addNoteToBeatmap() {
  if (mouseIsPressed) {
    if (!isMouseHeld) {
      // Capture the time when the mouse was first pressed
      mousePressStartTime = millis();
      isMouseHeld = true;
    }
  } else if (isMouseHeld) {
    // When mouse is released, calculate the note's properties
    let currentTime = millis();
    let pressDuration = (currentTime - mousePressStartTime) / 1000; // Convert to seconds
    let noteType = pressDuration > 1 ? "hold" : "tap"; // More than 1 second becomes a hold note
    let notePosition = (mousePressStartTime - startTime) / 1000; // Convert to seconds

    // Add the note to the beatmap
    beatMapData.notes.push({
      "type": noteType,
      "time": pressDuration,  // Duration of the note
      "position": notePosition // Timestamp of when the note was pressed
    });

    console.log("New note added:", {
      "type": noteType,
      "time": pressDuration,
      "position": notePosition
    });

    // Reset the mouse press tracking variables
    isMouseHeld = false;
    mousePressStartTime = null;
  }
}

function saveBeatMapData() {
  let json = JSON.stringify(beatMapData, null, 2);
  
  saveJSON(beatMapData, 'beatmap.json');
  
  console.log("BeatMap data saved to beatmap.json");
}



