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
  coolRatio: 0,
  neutralRatio: 0
};

function setup() {
  createCanvas(1000, 900);
  
  // make buttons for each painting
  for (let i = 0; i < famousPaintings.length; i++) {
    let btn = createButton(famousPaintings[i].name);
    // space them out, position below title
    btn.position(50 + i * 140, 70);
    btn.mousePressed(function() {
      switchPainting(i);
    });
  }
  
  // button to upload your own image
  let uploadBtn = createFileInput(handleImageUpload);
  uploadBtn.position(50 + famousPaintings.length * 140, 70);
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
  emotionAnalysis.dominantEmotion = "";
  emotionAnalysis.colorMood = "";
  emotionAnalysis.warmRatio = 0;
  emotionAnalysis.coolRatio = 0;
  emotionAnalysis.neutralRatio = 0;
  let foundColors = [];
  
  // look at pixels in the image,check every 10th pixel
  let step = 10;
  let colorMap = {}; // use object to count color frequency
  
  for (let x = 0; x < currentImg.width; x += step) {
    for (let y = 0; y < currentImg.height; y += step) {
      let pixel = currentImg.get(x, y);
      let r = red(pixel);
      let g = green(pixel);
      let b = blue(pixel);
      
      
      // quantize colors more aggressively to group similar colors together
      // divide by 15 and round to merge more similar colors
      let qr = floor(r / 15) * 15;
      let qg = floor(g / 15) * 15;
      let qb = floor(b / 15) * 15;
      let colorKey = qr + "," + qg + "," + qb;
      
      if (colorMap[colorKey]) {
        colorMap[colorKey].count++;
        // update average color (weighted by count)
        let total = colorMap[colorKey].count;
        colorMap[colorKey].r = (colorMap[colorKey].r * (total - 1) + r) / total;
        colorMap[colorKey].g = (colorMap[colorKey].g * (total - 1) + g) / total;
        colorMap[colorKey].b = (colorMap[colorKey].b * (total - 1) + b) / total;
      } else {
        colorMap[colorKey] = {
          r: r,
          g: g,
          b: b,
          count: 1
        };
      }
    }
  }
  
  // convert map to array
  for (let key in colorMap) {
    foundColors.push(colorMap[key]);
  }
  
  // further merge very similar colors after quantization
  let mergedColors = [];
  for (let i = 0; i < foundColors.length; i++) {
    let merged = false;
    for (let j = 0; j < mergedColors.length; j++) {
      // calculate color distance
      let dr = foundColors[i].r - mergedColors[j].r;
      let dg = foundColors[i].g - mergedColors[j].g;
      let db = foundColors[i].b - mergedColors[j].b;
      let distance = sqrt(dr * dr + dg * dg + db * db);
      
      // if colors are very similar (within 20 RGB units), treat as one color
      if (distance < 20) {
        let totalCount = mergedColors[j].count + foundColors[i].count;
        mergedColors[j].r = (mergedColors[j].r * mergedColors[j].count + foundColors[i].r * foundColors[i].count) / totalCount;
        mergedColors[j].g = (mergedColors[j].g * mergedColors[j].count + foundColors[i].g * foundColors[i].count) / totalCount;
        mergedColors[j].b = (mergedColors[j].b * mergedColors[j].count + foundColors[i].b * foundColors[i].count) / totalCount;
        mergedColors[j].count = totalCount;
        merged = true;
        break;
      }
    }
    if (!merged) {
      mergedColors.push({
        r: foundColors[i].r,
        g: foundColors[i].g,
        b: foundColors[i].b,
        count: foundColors[i].count
      });
    }
  }
  
  // sort by count (most frequent first)
  mergedColors.sort(function(a, b) {
    return b.count - a.count;
  });
  
  foundColors = mergedColors;
  
  colorPalette = [];
  extractedColors = [];
  
  // pick colors for particles
  for (let i = 0; i < 20 && i < foundColors.length; i++) {
    extractedColors.push({
      r: foundColors[i].r,
      g: foundColors[i].g,
      b: foundColors[i].b
    });
  }
  
  // pick colors for palette (top 9 most frequent colors)
  for (let i = 0; i < 9 && i < foundColors.length; i++) {
    colorPalette.push({
      r: foundColors[i].r,
      g: foundColors[i].g,
      b: foundColors[i].b
    });
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
  if (colorPalette.length === 0) {
    emotionAnalysis.dominantEmotion = "";
    emotionAnalysis.colorMood = "";
    emotionAnalysis.warmRatio = 0;
    emotionAnalysis.coolRatio = 0;
    emotionAnalysis.neutralRatio = 0;
    return;
  }
  
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
  let neutralRatio = 1 - warmRatio - coolRatio;
  
  let emotion = "";
  let description = "";
  
  // decide emotion based on warm/cool ratio
  // check warm ratio first
  if (warmRatio > 0.6) {
    emotion = "Energetic";
    description = "Energetic colors create feelings of energy and warmth";
  } else if (warmRatio > 0.3) {
    emotion = "Cheerful";
    description = "Cheerful colors bring a sense of joy and positivity";
  } 
  // then check cool ratio
  else if (coolRatio > 0.6) {
    emotion = "Gentle";
    description = "Gentle colors evoke feelings of peace and calmness";
  } else if (coolRatio > 0.3) {
    emotion = "Calm";
    description = "Calm colors create a peaceful and relaxing atmosphere";
  } 
  // balanced cases
  else {
    if (neutralRatio > 0.5) {
      emotion = "Neutral";
      description = "Neutral colors create a balanced and harmonious feeling";
    } else {
      emotion = "Balanced";
      description = "Warm and cool colors are balanced";
    }
  }
  
  // save results
  emotionAnalysis.dominantEmotion = emotion;
  emotionAnalysis.colorMood = description;
  emotionAnalysis.warmRatio = warmRatio;
  emotionAnalysis.coolRatio = coolRatio;
  emotionAnalysis.neutralRatio = neutralRatio;
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
    let imgY = 160;
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
  let paletteY = 160;
  
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
  let paletteY = 160;
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
  
  // use warmRatio, neutralRatio and coolRatio directly
  let warmPercent = emotionAnalysis.warmRatio;
  let neutralPercent = emotionAnalysis.neutralRatio;
  let coolPercent = emotionAnalysis.coolRatio;
  
  // calculate positions for labels above the bar
  let labelY = startY - 8;
  let labelSpacing = 50;
  let labelX = paletteX;
  
  // draw labels above bar in order: warm, cool, neutral
  fill(255);
  textSize(11);
  textAlign(LEFT);
  
  // only show labels that have values > 0
  if (warmPercent > 0) {
    text("Warm", labelX, labelY);
    labelX += labelSpacing;
  }
  
  if (coolPercent > 0) {
    text("Cool", labelX, labelY);
    labelX += labelSpacing;
  }
  
  if (neutralPercent > 0) {
    text("Neutral", labelX, labelY);
  }
  
  // gray background bar
  fill(128, 128, 128, 100);
  rect(paletteX, startY, barWidth, barHeight);
  
  // calculate widths
  let warmWidth = warmPercent * barWidth;
  let neutralWidth = neutralPercent * barWidth;
  let coolWidth = coolPercent * barWidth;
  
  let currentX = paletteX;
  
  // red part for warm
  if (warmPercent > 0) {
    fill(255, 100, 100, 200);
    rect(currentX, startY, warmWidth, barHeight);
    currentX += warmWidth;
  }
  
  // blue part for cool
  if (coolPercent > 0) {
    fill(100, 100, 255, 200);
    rect(currentX, startY, coolWidth, barHeight);
    currentX += coolWidth;
  }
  
  // gray part for neutral
  if (neutralPercent > 0) {
    fill(150, 150, 150, 200);
    rect(currentX, startY, neutralWidth, barHeight);
  }
}

function drawInfo() {
  // draw title
  fill(255, 255, 255, 255);
  textAlign(LEFT);
  textSize(28);
  text("Painting Visualize", 50, 40);
  
  // show painting name
  fill(255);
  textSize(18);
  text(currentPaintingName, 50, 130);
  
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
