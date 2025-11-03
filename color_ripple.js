let ripples = [];
let lastColorIndex = -1;
let autoRippleTimer = 0;
let autoRippleInterval = 120;

// colors to use
let colors = [
  { r: 255, g: 0, b: 0 },      // Red
  { r: 255, g: 165, b: 0 },    // Orange
  { r: 255, g: 255, b: 0 },    // Yellow
  { r: 0, g: 255, b: 0 },      // Green
  { r: 0, g: 255, b: 255 },    // Cyan
  { r: 0, g: 0, b: 255 },      // Blue
  { r: 128, g: 0, b: 128 },    // Purple
  { r: 255, g: 192, b: 203 },  // Pink
  { r: 255, g: 215, b: 0 },    // Gold
  { r: 255, g: 20, b: 147 },   // Deep Pink
  { r: 160, g: 82, b: 45 },    // Brown
  { r: 255, g: 165, b: 79 }    // Light Orange
];

function setup() {
  createCanvas(1000, 900);
  
  setupNavigationButton();
  
  // make first ripple
  let randomX = random(100, width - 100);
  let randomY = random(100, height - 100);
  createRipple(randomX, randomY);
}

function draw() {
  // make old ripples fade
  fill(20, 20, 30, 30);
  noStroke();
  rect(0, 0, width, height);
  
  // auto create ripples
  autoRippleTimer = autoRippleTimer + 1;
  if (autoRippleTimer >= autoRippleInterval) {
    let randomX = random(100, width - 100);
    let randomY = random(100, height - 100);
    createRipple(randomX, randomY);
    autoRippleTimer = 0;
  }
  
  updateAndDrawRipples();
  drawInstructions();
}

function updateAndDrawRipples() {
  for (let i = ripples.length - 1; i >= 0; i--) {
    let ripple = ripples[i];
    
    // make it bigger
    ripple.radius = ripple.radius + ripple.speed;
    
    // fade out as it gets bigger
    if (ripple.radius < ripple.maxRadius) {
      ripple.alpha = 255 - (ripple.radius / ripple.maxRadius) * 255;
    } else {
      ripple.alpha = 0;
    }
    
    // remove if invisible
    if (ripple.alpha <= 0 || ripple.radius > ripple.maxRadius) {
      ripples.splice(i, 1);
      continue;
    }
    
    drawRipple(ripple);
  }
}

function drawRipple(ripple) {
  let numRings = 4;
  
  for (let ringNum = 0; ringNum < numRings; ringNum++) {
    let ringSize = ripple.radius - ringNum * 12;
    
    if (ringSize <= 0) continue;
    
    // outer rings fade more
    let ringAlpha = ripple.alpha * (1 - ringNum * 0.25);
    if (ringAlpha > 255) ringAlpha = 255;
    if (ringAlpha < 0) ringAlpha = 0;
    
    fill(ripple.r, ripple.g, ripple.b, ringAlpha);
    noStroke();
    ellipse(ripple.x, ripple.y, ringSize * 2);
    
    // draw inner circle for ring effect
    if (ringNum < numRings - 1) {
      let innerSize = ringSize - 8;
      fill(20, 20, 30, ringAlpha * 0.5);
      ellipse(ripple.x, ripple.y, innerSize * 2);
    }
  }

}

function drawInstructions() {
  fill(255, 255, 255, 200);
  textAlign(LEFT);
  textSize(14);
  text("Ripples appear automatically", 10, 50);
  text("Click anywhere to add more ripples", 10, 70);
  text("Colors blend when ripples overlap", 10, 90);
}

function mousePressed() {
  createRipple(mouseX, mouseY);
}

function touchStarted() {
  if (touches.length > 0) {
    createRipple(touches[0].x, touches[0].y);
  }
  return false;
}

function createRipple(x, y) {
  // pick a color
  let randomIndex = floor(random(colors.length));
  
  // try not to use same color twice
  if (randomIndex === lastColorIndex && colors.length > 1) {
    randomIndex = floor(random(colors.length));
  }
  
  lastColorIndex = randomIndex;
  let chosenColor = colors[randomIndex];
  
  let newRipple = {
    x: x,
    y: y,
    r: chosenColor.r,
    g: chosenColor.g,
    b: chosenColor.b,
    radius: 0,
    speed: 1.4,
    maxRadius: 300,
    alpha: 255
  };
  
  ripples.push(newRipple);
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
  nextBtn.mousePressed(function() {
    window.location.href = 'index.html?scene=2';
  });
  
  // back button
  let backBtn = createButton('Back');
  backBtn.position(20, height - 50);
  backBtn.style('background-color', 'rgba(118, 75, 162, 0.8)');
  backBtn.style('color', 'white');
  backBtn.style('border', 'none');
  backBtn.style('padding', '10px 20px');
  backBtn.style('border-radius', '8px');
  backBtn.style('font-size', '14px');
  backBtn.style('cursor', 'pointer');
  backBtn.mousePressed(function() {
    window.location.href = 'index.html?scene=0';
  });
}

