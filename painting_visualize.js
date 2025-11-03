let currentImg = null;
// main colors we show
let colorPalette = [];
// all colors for particles
let extractedColors = [];
// the moving dots
let particles = [];

// some famous paintings preadded
let famousPaintings = [
  {
    name: "Starry Night",
    artist: "Van Gogh",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/600px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg"
  },
  {
    name: "The Scream",
    artist: "Edvard Munch",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/The_Scream.jpg/600px-The_Scream.jpg"
  },
  {
    name: "Sunflowers",
    artist: "Van Gogh",
    url: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Van_Gogh_Vase_with_Fifteen_Sunflowers.jpg"
  },
  {
    name: "The Great Wave",
    artist: "Hokusai",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/600px-The_Great_Wave_off_Kanagawa.jpg"
  },
  {
    name: "Water Lilies",
    artist: "Monet",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Monet_Water-Lilies_1903_DAI.jpg"
  }
];

let currentPaintingIndex = 0;
let currentPaintingName = "";

// store what emotion the colors have
let emotionAnalysis = {
  dominantEmotion: "",
  colorMood: "",
  warmRatio: 0,
  coolRatio: 0
};

function setup() {
  createCanvas(1000, 900);
  
  // make buttons for each painting
  for (let i = 0; i < famousPaintings.length; i++) {
    let btn = createButton(famousPaintings[i].name);
    // space them out
    btn.position(10 + i * 140, 10);
    btn.mousePressed(function() {
      switchPainting(i);
    });
  }
  
  // button to upload your own image
  let uploadBtn = createFileInput(handleImageUpload);
  uploadBtn.position(10 + famousPaintings.length * 140, 10);
  // only images
  uploadBtn.attribute('accept', 'image/*');
  uploadBtn.style('font-size', '12px');
  
  // load first painting when page starts
  loadPainting(0);
  setupNavigationButton();
}

function switchPainting(index) {
  // dont switch if clicking same one
  if (index === currentPaintingIndex) return;
  
  currentPaintingIndex = index;
  loadPainting(index);
}

function loadPainting(index) {
  let painting = famousPaintings[index];
  currentPaintingName = painting.name + " by " + painting.artist;
  
  // load the image from url
  loadImage(
    painting.url,
    function(img) {
      currentImg = img;
      // get colors once image loads
      extractColors();
    },
    function() {
      // if it fails
      console.log("Failed to load image");
    }
  );
}

function handleImageUpload(file) {
  if (file.type === 'image') {
    currentPaintingName = "Your Uploaded Image";
    
    // try to load it
    loadImage(
      file.data,
      function(img) {
        currentImg = img;
        // get colors from your image
        extractColors();
      },
      function() {
        console.log("Failed to load uploaded image");
        // show error
        alert("Failed to load image. Please try another file.");
      }
    );
  } else {
    // not an image
    alert("Please select an image file.");
  }
}

function extractColors() {
  // no image yet
  if (!currentImg) return;
  
  // reset everything
  colorPalette = [];
  extractedColors = [];
  let foundColors = [];
  
  // look at pixels in the image,check every 10th pixel
  let step = 10;
  for (let x = 0; x < currentImg.width; x += step) {
    for (let y = 0; y < currentImg.height; y += step) {
      let pixel = currentImg.get(x, y);
      let r = red(pixel);
      let g = green(pixel);
      let b = blue(pixel);
      
      // skip pixels that are too dark or too light (boring colors)
      let brightness = (r + g + b) / 3;
      if (brightness < 30 || brightness > 230) continue;
      
      foundColors.push({
        r: r,
        g: g,
        b: b
      });
    }
  }
  
  colorPalette = [];
  extractedColors = [];
  
  // pick random colors for particles (need more)
  for (let i = 0; i < 20 && i < foundColors.length; i++) {
    let randomIndex = floor(random(foundColors.length));
    extractedColors.push(foundColors[randomIndex]);
  }
  
  // pick random colors for palette (just 8 is enough)
  for (let i = 0; i < 8 && i < foundColors.length; i++) {
    let randomIndex = floor(random(foundColors.length));
    colorPalette.push(foundColors[randomIndex]);
  }
  
  // figure out if colors are warm or cool
  analyzeColorEmotions();
  // make particles move around
  createParticles();
}

function createParticles() {
  // clear old ones
  particles = [];
  
  // make particles from colors (2 for each color)
  for (let i = 0; i < extractedColors.length; i++) {
    let color = extractedColors[i];
    
    // first particle
    particles.push({
      x: random(width),
      y: random(height),
      r: color.r,
      g: color.g,
      b: color.b,
      size: 7,
      // random speed
      speedX: random(-1, 1),
      speedY: random(-1, 1)
    });
    
    // second particle with same color
    particles.push({
      x: random(width),
      y: random(height),
      r: color.r,
      g: color.g,
      b: color.b,
      size: 7,
      speedX: random(-1, 1),
      speedY: random(-1, 1)
    });
  }
}

function analyzeColorEmotions() {
  // nothing to analyze
  if (colorPalette.length === 0) return;
  
  let warmCount = 0;
  let coolCount = 0;
  
  // count how many warm vs cool colors
  for (let i = 0; i < colorPalette.length; i++) {
    let color = colorPalette[i];
    let r = color.r;
    let b = color.b;
    
    // if red is way more than blue, its warm
    if (r > b + 30) {
      warmCount++;
    } 
    // if blue is way more than red, its cool
    else if (b > r + 30) {
      coolCount++;
    }
  }
  
  // calculate percentages
  let warmRatio = warmCount / colorPalette.length;
  let coolRatio = coolCount / colorPalette.length;
  
  let emotion = "";
  let description = "";
  
  // decide what emotion
  if (warmCount > coolCount) {
    emotion = "Warm";
    description = "Warm colors create feelings of energy and warmth";
  } else if (coolCount > warmCount) {
    emotion = "Cool";
    description = "Cool colors evoke feelings of peace and calmness";
  } else {
    emotion = "Balanced";
    description = "Warm and cool colors are balanced";
  }
  
  // save results
  emotionAnalysis.dominantEmotion = emotion;
  emotionAnalysis.colorMood = description;
  emotionAnalysis.warmRatio = warmRatio;
  emotionAnalysis.coolRatio = coolRatio;
}

function draw() {
  // background color from first color in image (make it darker)
  if (extractedColors.length > 0) {
    let bgColor = extractedColors[0];
    // * 0.2 makes it darker
    background(bgColor.r * 0.2, bgColor.g * 0.2, bgColor.b * 0.2);
  } else {
    // default dark background
    background(20, 20, 30);
  }
  
  // draw moving dots first
  drawParticles();
  
  // draw the painting/image
  if (currentImg) {
    let imgX = 50;
    let imgY = 120;
    let imgWidth = 500;
    // keep proportions
    let imgHeight = (currentImg.height / currentImg.width) * imgWidth;
    image(currentImg, imgX, imgY, imgWidth, imgHeight);
  }
  
  // show color squares
  drawColorPalette();
  // show painting name
  drawInfo();
}

function drawParticles() {
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    
    // move the particle
    p.x = p.x + p.speedX;
    p.y = p.y + p.speedY;
    
    // wrap around screen edges
    if (p.x < 0) {
      p.x = width;
    }
    if (p.x > width) {
      p.x = 0;
    }
    if (p.y < 0) {
      p.y = height;
    }
    if (p.y > height) {
      p.y = 0;
    }
    
    // dont draw if its in the palette area
    if (p.x > 580 && p.y > 100) {
      continue;
    }
    
    // draw the particle, with some transparency
    fill(p.r, p.g, p.b, 150);
    noStroke();
    ellipse(p.x, p.y, p.size);
  }
}

function drawColorPalette() {
  // where to start on right side
  let paletteX = 600;
  let paletteY = 120;
  
  // title
  fill(255);
  textAlign(LEFT);
  textSize(20);
  text("Color Palette", paletteX, paletteY);
  
  // size of each color square
  let squareSize = 60;
  // space between squares
  let spaceBetween = 70;
  // 3 columns
  let numCols = 3;
  
  // draw each color as a square
  for (let i = 0; i < colorPalette.length; i++) {
    // which column (0, 1, or 2)
    let col = i % numCols;
    // which row
    let row = Math.floor(i / numCols);
    let x = paletteX + col * spaceBetween;
    let y = paletteY + 30 + row * spaceBetween;
    
    let color = colorPalette[i];
    
    // draw the color square
    fill(color.r, color.g, color.b);
    noStroke();
    rect(x, y, squareSize, squareSize);
    
    // white border around it
    stroke(255);
    strokeWeight(2);
    noFill();
    rect(x, y, squareSize, squareSize);
    noStroke();
  }
  
  // show emotion analysis
  drawEmotionAnalysis();
}

function drawEmotionAnalysis() {
  if (!emotionAnalysis.dominantEmotion) return;
  
  let paletteX = 600;
  let paletteY = 120;
  let spaceBetween = 70;
  let numCols = 3;
  
  // check how many rows of colors
  let numRows = 0;
  if (colorPalette.length <= 3) {
    numRows = 1;
  } else if (colorPalette.length <= 6) {
    numRows = 2;
  } else {
    numRows = 3;
  }
  
  let startY = paletteY + 30 + numRows * spaceBetween + 40;  
  // title
  fill(255, 200);
  textSize(18);
  text("Emotion Analysis", paletteX, startY);
  
  // emotion name
  startY += 35;
  textSize(16);
  // yellow color
  fill(255, 255, 100, 255);
  text(emotionAnalysis.dominantEmotion, paletteX, startY);
  
  // description
  startY += 30;
  textSize(13);
  // light green
  fill(200, 255, 200, 255);
  text(emotionAnalysis.colorMood, paletteX, startY);
  
  // draw the warm/cool bar
  drawWarmCoolBar(startY + 30);
}

function drawWarmCoolBar(startY) {
  let paletteX = 600;
  let barWidth = 200;
  let barHeight = 14;
  
  // default to 50/50 if we dont have data
  let warmPercent = 0.5;
  let coolPercent = 0.5;
  
  // calculate actual percentages
  let totalRatio = emotionAnalysis.warmRatio + emotionAnalysis.coolRatio;
  if (totalRatio > 0) {
    warmPercent = emotionAnalysis.warmRatio / totalRatio;
    coolPercent = emotionAnalysis.coolRatio / totalRatio;
  }
  
  // gray background bar
  fill(128, 128, 128, 100);
  rect(paletteX, startY, barWidth, barHeight);
  
  // red part for warm
  fill(255, 100, 100, 200);
  let warmWidth = warmPercent * barWidth;
  rect(paletteX, startY, warmWidth, barHeight);
  
  // blue part for cool
  fill(100, 100, 255, 200);
  let coolWidth = coolPercent * barWidth;
  rect(paletteX + warmWidth, startY, coolWidth, barHeight);
  
  // labels
  fill(255);
  textSize(11);
  textAlign(LEFT);
  text("Warm", paletteX, startY - 3);
  text("Cool", paletteX + barWidth + 5, startY - 3);
}

function drawInfo() {
  // show painting name at top
  fill(255);
  textAlign(LEFT);
  textSize(18);
  text(currentPaintingName, 50, 100);
  
  // show message if no image loaded
  if (!currentImg) {
    textSize(14);
    fill(200);
    text("Please upload an image or select a painting", 50, height - 80);
  }
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
    // go to scene 0 (loop)
    window.location.href = 'index.html?scene=0';
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
    window.location.href = 'index.html?scene=1';
  });
}
