// dot class
class Dot {
  constructor(x, y, r, g, b) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.g = g;
    this.b = b;
    // make it move by itself
    this.vx = random(-1, 1);
    this.vy = random(-1, 1);
    // 0=circle, 1=square, 2=triangle
    this.shape = 0;
    this.isDragging = false;
    this.trail = [];
    this.glowSize = 0;
    this.glowPulse = random(0, TWO_PI);
    this.scale = 1.0;
  }
}

let dots = [];
let draggedDot = null;

// some colors to use
let basicColors = [
  [255, 0, 0],    // red
  [255, 255, 0],  // yellow
  [0, 0, 255],    // blue
  [0, 255, 0],    // green
  [0, 255, 255],  // cyan
  [255, 0, 255]   // magenta
];

function setup() {
  createCanvas(1000, 900);
  
  setupNavigationButton();
  
  // make some dots at the start
  for (let i = 0; i < 8; i++) {
    let randomColor = basicColors[floor(random(basicColors.length))];
    addDot(random(100, width - 100), random(100, height - 100), randomColor[0], randomColor[1], randomColor[2]);
  }
}

function draw() {
  background(0, 0, 0);
  
  // update dots
  for (let i = 0; i < dots.length; i++) {
    updateSingleDot(dots[i]);
  }
  
  // draw dots
  for (let i = 0; i < dots.length; i++) {
    drawSingleDot(dots[i]);
  }
  
  checkForDotMerge();
  drawInstructions();
}

// update one dot
function updateSingleDot(dot) {
  // make it smaller after merging
  if (dot.scale > 1.0) {
    dot.scale = dot.scale - 0.05;
    if (dot.scale < 1.0) {
      dot.scale = 1.0;
    }
  }
  
  if (dot.isDragging) {
    updateDotTrail(dot);
    dot.glowSize = 20;
  } else {
    updateDotPosition(dot);
    updateDotGlow(dot);
  }
}

// move the dot
function updateDotPosition(dot) {
  dot.x = dot.x + dot.vx;
  dot.y = dot.y + dot.vy;
  
  // bounce off edges
  if (dot.x < 25 || dot.x > width - 25) {
    dot.vx = -dot.vx;
  }
  if (dot.y < 25 || dot.y > height - 25) {
    dot.vy = -dot.vy;
  }
}

// make it glow
function updateDotGlow(dot) {
  dot.glowPulse += 0.1;
  dot.glowSize = 10 + sin(dot.glowPulse) * 5;
}

// add trail when dragging
function updateDotTrail(dot) {
  dot.trail.push({x: dot.x, y: dot.y, alpha: 200});
  if (dot.trail.length > 15) {
    dot.trail.shift();
  }
}

// draw one dot
function drawSingleDot(dot) {
  if (dot.isDragging) {
    drawDotTrail(dot);
  }
  drawDotGlow(dot);
  drawDotShape(dot);
  drawDotBorder(dot);
}

// draw the trail
function drawDotTrail(dot) {
  if (dot.trail.length > 1) {
    for (let j = 0; j < dot.trail.length - 1; j++) {
      let alpha = (dot.trail[j].alpha * j) / dot.trail.length;
      stroke(dot.r, dot.g, dot.b, alpha);
      strokeWeight(8 - j * 0.5);
      line(dot.trail[j].x, dot.trail[j].y, dot.trail[j + 1].x, dot.trail[j + 1].y);
    }
  }
}

// draw glow
function drawDotGlow(dot) {
  fill(dot.r, dot.g, dot.b, 100);
  noStroke();
  ellipse(dot.x, dot.y, (45 + dot.glowSize) * dot.scale);
}

// draw the shape
function drawDotShape(dot) {
  fill(dot.r, dot.g, dot.b);
  noStroke();
  
  let dotSize = 45 * dot.scale;
  
  if (dot.shape == 0) {
    drawCircleShape(dot, dotSize);
  } else if (dot.shape == 1) {
    drawSquareShape(dot, dotSize);
  } else {
    drawTriangleShape(dot, dotSize);
  }
}

function drawCircleShape(dot, size) {
  ellipse(dot.x, dot.y, size);
}

// square that rotates
function drawSquareShape(dot, size) {
  push();
  translate(dot.x, dot.y);
  rotate(frameCount * 0.02);
  rectMode(CENTER);
  rect(0, 0, size, size);
  pop();
}

function drawTriangleShape(dot, size) {
  let triangleHeight = size * 0.866;
  triangle(dot.x, dot.y - triangleHeight / 2, 
           dot.x - size / 2, dot.y + triangleHeight / 2, 
           dot.x + size / 2, dot.y + triangleHeight / 2);
}

// draw border
function drawDotBorder(dot) {
  stroke(dot.r * 1.2, dot.g * 1.2, dot.b * 1.2, 150);
  strokeWeight(2);
  noFill();
  
  let dotSize = 45 * dot.scale;
  
  if (dot.shape == 0) {
    ellipse(dot.x, dot.y, dotSize);
  } else if (dot.shape == 1) {
    rectMode(CENTER);
    rect(dot.x, dot.y, dotSize, dotSize);
  } else {
    let triangleHeight = dotSize * 0.866;
    triangle(dot.x, dot.y - triangleHeight / 2, 
             dot.x - dotSize / 2, dot.y + triangleHeight / 2, 
             dot.x + dotSize / 2, dot.y + triangleHeight / 2);
  }
  
  noStroke();
}

// check if dots should merge
function checkForDotMerge() {
  if (draggedDot == null) {
    return;
  }
  
  for (let i = 0; i < dots.length; i++) {
    let otherDot = dots[i];
    
    if (otherDot == draggedDot || otherDot.isDragging == true) {
      continue;
    }
    
    let distance = dist(draggedDot.x, draggedDot.y, otherDot.x, otherDot.y);
    
    if (distance < 20) {
      mergeDots(draggedDot, otherDot);
      break;
    }
  }
}

// mix two dots
function mergeDots(dot1, dot2) {
  // mix the colors
  let newR = (dot1.r + dot2.r) / 2;
  let newG = (dot1.g + dot2.g) / 2;
  let newB = (dot1.b + dot2.b) / 2;
  
  // middle of both dots
  let newX = (dot1.x + dot2.x) / 2;
  let newY = (dot1.y + dot2.y) / 2;
  
  // remove old dots
  let index1 = dots.indexOf(dot1);
  let index2 = dots.indexOf(dot2);
  if (index1 < index2) {
    removeDot(index2);
    removeDot(index1);
  } else {
    removeDot(index1);
    removeDot(index2);
  }
  
  // make new dot
  let newDot = new Dot(newX, newY, newR, newG, newB);
  newDot.shape = floor(random(3));
  newDot.glowSize = 30;
  newDot.scale = 1.5;
  dots.push(newDot);
  
  draggedDot = null;
}

function mousePressed() {
  let clickedDot = false;
  for (let i = dots.length - 1; i >= 0; i--) {
    let dot = dots[i];
    let distance = dist(mouseX, mouseY, dot.x, dot.y);
    if (distance < 45) {
      dot.isDragging = true;
      draggedDot = dot;
      dot.vx = 0;
      dot.vy = 0;
      dot.trail = [];
      clickedDot = true;
      return;
    }
  }
  
  // add new dot if clicked empty space
  if (!clickedDot) {
    let randomColor = basicColors[floor(random(basicColors.length))];
    addDot(mouseX, mouseY, randomColor[0], randomColor[1], randomColor[2]);
  }
}

function mouseDragged() {
  if (draggedDot != null) {
    draggedDot.x = mouseX;
    draggedDot.y = mouseY;
  }
}

function mouseReleased() {
  if (draggedDot != null) {
    draggedDot.isDragging = false;
    draggedDot.vx = random(-1, 1);
    draggedDot.vy = random(-1, 1);
    draggedDot.trail = [];
    draggedDot = null;
  }
}

function addDot(x, y, r, g, b) {
  let newDot = new Dot(x, y, r, g, b);
  newDot.shape = floor(random(3));
  dots.push(newDot);
}

function removeDot(index) {
  dots.splice(index, 1);
}

function drawInstructions() {
  // draw title
  fill(255, 255, 255, 255);
  textAlign(LEFT);
  textSize(28);
  text("Color Mix", 20, 40);
  
  // draw instructions
  fill(255, 255, 255, 200);
  textSize(14);
  text("Drag two dots together to mix colors", 20, 70);
  text("Mixed dots get a new random shape", 20, 90);
  text("Click anywhere to add new color dots", 20, 110);
}

function setupNavigationButton() {
  // next scene button
  let nextBtn = createButton('Explore More');
  nextBtn.position(width - 140, height - 50);
  nextBtn.style('background-color', 'rgba(102, 126, 234, 0.8)');
  nextBtn.style('color', 'white');
  nextBtn.style('border', 'none');
  nextBtn.style('padding', '10px 20px');
  nextBtn.style('border-radius', '8px');
  nextBtn.style('font-size', '14px');
  nextBtn.style('cursor', 'pointer');
  nextBtn.mousePressed(() => {
    window.location.href = 'index.html?scene=1';
  });
}


