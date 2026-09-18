import fs from 'fs';
import { Resvg } from '@resvg/resvg-js';

const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#9a3412"/>
    </linearGradient>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#fed7aa"/>
    </linearGradient>
  </defs>

  <!-- Background with rounded corners -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <rect x="8" y="8" width="496" height="496" rx="104" fill="none" stroke="#ffffff" stroke-width="6" stroke-opacity="0.25"/>

  <!-- Motorcycle Silhouette & Brand Symbol -->
  <g>
    <!-- Rear Wheel -->
    <circle cx="155" cy="335" r="58" fill="none" stroke="#ffffff" stroke-width="22"/>
    <circle cx="155" cy="335" r="24" fill="#ffffff"/>
    
    <!-- Front Wheel -->
    <circle cx="357" cy="335" r="58" fill="none" stroke="#ffffff" stroke-width="22"/>
    <circle cx="357" cy="335" r="24" fill="#ffffff"/>

    <!-- Motorcycle Frame Lines -->
    <path d="M155 335 L225 245 L320 245 L357 335" fill="none" stroke="#ffffff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    
    <!-- Central Engine Block / Gear Area -->
    <path d="M215 335 L245 265 L295 265 L310 335 Z" fill="#ffffff" fill-opacity="0.95"/>

    <!-- Fuel Tank & Seat -->
    <path d="M195 240 C215 210 270 205 315 225 L300 250 L205 250 Z" fill="#ffffff"/>

    <!-- Handlebars & Front Fork -->
    <path d="M357 335 L315 185 L285 185" fill="none" stroke="#ffffff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Prominent Emblem Letter 'L' (Lucky Bike Care) -->
    <path d="M236 100 L276 100 L276 155 L315 155 L315 185 L236 185 Z" fill="url(#metalGrad)"/>
  </g>

  <!-- Clean Top Badge: LUCKY BIKE -->
  <text x="256" y="85" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="900" font-size="34" letter-spacing="4" fill="#ffffff">LUCKY BIKE</text>
  <text x="256" y="445" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="800" font-size="22" letter-spacing="6" fill="#fed7aa">CARE CENTER</text>
</svg>`;

const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#9a3412"/>
    </linearGradient>
    <linearGradient id="metalGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#fed7aa"/>
    </linearGradient>
  </defs>

  <!-- Full-bleed background for maskable (Android clips safe zone) -->
  <rect width="512" height="512" fill="url(#bgGradMask)"/>

  <!-- Scaled to 78% and centered strictly inside safe zone -->
  <g transform="translate(56.32, 56.32) scale(0.78)">
    <!-- Rear Wheel -->
    <circle cx="155" cy="335" r="58" fill="none" stroke="#ffffff" stroke-width="22"/>
    <circle cx="155" cy="335" r="24" fill="#ffffff"/>
    
    <!-- Front Wheel -->
    <circle cx="357" cy="335" r="58" fill="none" stroke="#ffffff" stroke-width="22"/>
    <circle cx="357" cy="335" r="24" fill="#ffffff"/>

    <!-- Motorcycle Frame Lines -->
    <path d="M155 335 L225 245 L320 245 L357 335" fill="none" stroke="#ffffff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    
    <!-- Central Engine Block / Gear Area -->
    <path d="M215 335 L245 265 L295 265 L310 335 Z" fill="#ffffff" fill-opacity="0.95"/>

    <!-- Fuel Tank & Seat -->
    <path d="M195 240 C215 210 270 205 315 225 L300 250 L205 250 Z" fill="#ffffff"/>

    <!-- Handlebars & Front Fork -->
    <path d="M357 335 L315 185 L285 185" fill="none" stroke="#ffffff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Prominent Emblem Letter 'L' (Lucky Bike Care) -->
    <path d="M236 100 L276 100 L276 155 L315 155 L315 185 L236 185 Z" fill="url(#metalGradMask)"/>

    <text x="256" y="85" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="900" font-size="34" letter-spacing="4" fill="#ffffff">LUCKY BIKE</text>
    <text x="256" y="445" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="800" font-size="22" letter-spacing="6" fill="#fed7aa">CARE CENTER</text>
  </g>
</svg>`;

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/icon.svg', standardSvg);
fs.writeFileSync('public/icon-maskable.svg', maskableSvg);

function renderPng(svgString, width, height, outputPath) {
  const resvg = new Resvg(svgString, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`Rendered: ${outputPath} (${width}x${height})`);
}

renderPng(standardSvg, 192, 192, 'public/pwa-192x192.png');
renderPng(standardSvg, 512, 512, 'public/pwa-512x512.png');
renderPng(maskableSvg, 512, 512, 'public/pwa-maskable-512x512.png');
renderPng(standardSvg, 180, 180, 'public/apple-touch-icon.png');
renderPng(standardSvg, 64, 64, 'public/favicon.ico');

console.log('All PWA icon assets successfully generated in /public!');
