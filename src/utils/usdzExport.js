import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// USDZ conversion utilities
export class USDZExporter {
  constructor() {
    this.loader = new GLTFLoader();
  }

  // Convert GLB to USDZ format (simplified approach)
  async convertGLBToUSDZ(glbPath, scale = 1) {
    try {
      // For production, you'd use a proper USDZ converter
      // For now, we'll create a reference to the GLB and use AR Quick Look
      const response = await fetch(glbPath);
      const arrayBuffer = await response.arrayBuffer();
      
      // Create a USDZ reference (iOS will handle the conversion)
      return this.createARQuickLookURL(glbPath, scale);
    } catch (error) {
      console.error('Error converting GLB to USDZ:', error);
      throw error;
    }
  }

  // Create AR Quick Look URL for iOS
  createARQuickLookURL(modelPath, scale = 1) {
    const baseURL = window.location.origin;
    const fullModelPath = modelPath.startsWith('/') ? modelPath : `/${modelPath}`;
    
    // AR Quick Look parameters
    const params = new URLSearchParams({
      'allowsContentScaling': '0',
      'canonicalWebPageURL': window.location.href,
      'scale': scale.toString()
    });

    return `${baseURL}${fullModelPath}#${params.toString()}`;
  }

  // Launch AR Quick Look on iOS
  launchARQuickLook(modelPath, scale = 1) {
    if (!this.isIOSDevice()) {
      throw new Error('AR Quick Look is only available on iOS devices');
    }

    // Use USDZ files for proper AR Quick Look support
    const baseURL = window.location.origin;
    const fullModelPath = modelPath.startsWith('/') ? modelPath : `/${modelPath}`;
    const modelURL = `${baseURL}${fullModelPath}`;
    
    // Method 1: Direct AR Quick Look with USDZ
    if (modelPath.includes('.usdz')) {
      const anchor = document.createElement('a');
      anchor.setAttribute('rel', 'ar');
      anchor.setAttribute('href', modelURL);
      anchor.style.display = 'none';
      
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => document.body.removeChild(anchor), 100);
      return;
    }
    
    // Method 2: Create dynamic AR page for USDZ
    const arPageContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AR Experience</title>
        <style>
          body { 
            margin: 0; background: #000; color: white; 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            display: flex; align-items: center; justify-content: center;
            min-height: 100vh; text-align: center;
          }
          .ar-container { max-width: 300px; }
          .ar-button {
            background: #007AFF; color: white; border: none;
            padding: 20px 40px; border-radius: 25px; font-size: 18px;
            font-weight: 600; cursor: pointer; text-decoration: none;
            display: inline-block; margin: 20px;
          }
        </style>
      </head>
      <body>
        <div class="ar-container">
          <h2>🥁 Drum Kit AR</h2>
          <a href="${modelURL}" rel="ar" class="ar-button">View in AR</a>
          <p>Tap the button to view the 3D model in augmented reality</p>
        </div>
      </body>
      </html>
    `;
    
    // Open AR page in new window
    const arWindow = window.open('', '_blank');
    arWindow.document.write(arPageContent);
    arWindow.document.close();
  }

  isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
}

// Available drum kit models for AR
export const DRUM_MODELS = {
  drum: '/ar/drum.usdz',
  cymbal: '/ar/cymbal.usdz', 
  drumstick: '/ar/drumstick.usdz',
  note: '/models/Note.glb'
};

// Export individual drum components
export const exportDrumToAR = async (component = 'drum', scale = 0.5) => {
  const exporter = new USDZExporter();
  const modelPath = DRUM_MODELS[component];
  
  if (!modelPath) {
    throw new Error(`Unknown drum component: ${component}`);
  }

  return exporter.launchARQuickLook(modelPath, scale);
};