# Color Magician

Just a fun color project I made with p5.js.

## How to Run

1. Open terminal
2. Go to the folder:
   ```bash
   cd /Users/andrea/Downloads/hw/codeA1/code/colorMagician
   ```
3. Start server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open browser:
   - `http://localhost:8000/index.html` or `http://localhost:8000/index.html?scene=0`
   - Scene 1: `http://localhost:8000/index.html?scene=1`
   - Scene 2: `http://localhost:8000/index.html?scene=2`

## Files

```
colorMagician/
├── index.html           # main page
├── color_mix.js        # scene 0
├── color_ripple.js     # scene 1
├── painting_visualize.js  # scene 2
├── style.css           
├── p5.js               
└── p5.sound.min.js     
```

## What Each Scene Does

There are 3 scenes:

**Scene 0** (`color_mix.js`):
- Dots move around
- Drag dots together to mix colors
- Click to add new dots
- Shapes: circle, square, triangle

**Scene 1** (`color_ripple.js`):
- Ripples show up automatically or when you click
- Each one has a random color
- Colors mix when they overlap
- Pretty cool to watch them spread!

**Scene 2** (`painting_visualize.js`):
- Upload your own image or pick from famous paintings
- Shows colors from the image
- Background has moving particles using those colors
- Tells you if colors are warm or cool

## Navigation

- "Explore More" button (bottom right) goes to next scene
- "Back" button (bottom left) goes back
- Order: Scene 0 → Scene 1 → Scene 2 → back to 0
