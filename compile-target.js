/**
 * Compile the mural image into a .mind target file.
 * Usage: node compile-target.js
 * 
 * This converts IMG_1171.JPG into targets.mind for MindAR image tracking.
 */
const { compileImageTargets } = require('mind-ar/dist/mindar-image.prod.js');
const fs = require('fs');
const path = require('path');

async function compile() {
  const imagePath = path.resolve(__dirname, 'IMG_1171.JPG');

  console.log('📸 Reading mural image...');
  const imageBuffer = fs.readFileSync(imagePath);

  // Create an image bitmap from the buffer
  // MindAR compiler expects image data, so we use the sharp-like approach
  // or canvas. For Node, we'll use @napi-rs/canvas or similar.
  
  // Actually, MindAR's compiler is browser-based. 
  // For Node.js compilation, we need to use mind-ar's Node API.
  
  console.log('🔧 Compiling image target... (this may take a minute)');
  
  try {
    const compiler = new (require('mind-ar/dist/mindar-image.prod.js').Compiler)();
    
    // Load image using canvas
    const { createCanvas, loadImage } = require('canvas');
    const img = await loadImage(imagePath);
    
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    await compiler.compileImageTargets([imageData], (progress) => {
      const pct = Math.round(progress * 100);
      process.stdout.write(`\r   Progress: ${pct}%`);
    });

    const exportedBuffer = await compiler.exportData();
    fs.writeFileSync(path.resolve(__dirname, 'targets.mind'), Buffer.from(exportedBuffer));
    console.log('\n✅ targets.mind created successfully!');
  } catch (err) {
    console.error('\n❌ Compilation failed:', err.message);
    console.log('\n💡 Alternative: Use the online MindAR compiler instead:');
    console.log('   https://hiukim.github.io/mind-ar-js-doc/tools/compile');
    console.log('   Upload IMG_1171.JPG, download the .mind file, and save it as targets.mind in this directory.');
  }
}

compile();
