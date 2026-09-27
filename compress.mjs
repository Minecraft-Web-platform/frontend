import sharp from 'sharp';
import fs from 'fs';

async function compress() {
  await sharp('public/png/auth-bg-dark.jpg')
    .resize(1920, 1080, { fit: 'fill' })
    .jpeg({ quality: 80, progressive: true })
    .toFile('public/png/auth-bg-dark-opt.jpg');
    
  await sharp('public/png/mirograd-dark.jpg')
    .resize(1920, 1080, { fit: 'fill' })
    .webp({ quality: 80 })
    .toFile('public/png/mirograd-dark-opt.webp');
    
  console.log('Compression complete!');
}

compress().catch(console.error);
