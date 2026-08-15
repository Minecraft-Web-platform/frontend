import sharp from 'sharp';
import fs from 'fs';

async function compress() {
  await sharp('public/png/auth-bg.jpg')
    .resize(1920)
    .jpeg({ quality: 80, progressive: true })
    .toFile('public/png/auth-bg-opt.jpg');
    
  await sharp('public/png/mirograd.png')
    .resize(1920)
    .webp({ quality: 80 })
    .toFile('public/png/mirograd-opt.webp');
    
  await sharp('src/assets/png/landing-header-bg.png')
    .resize(1920)
    .webp({ quality: 80 })
    .toFile('src/assets/png/landing-header-bg-opt.webp');
    
  console.log('Compression complete!');
}

compress().catch(console.error);
