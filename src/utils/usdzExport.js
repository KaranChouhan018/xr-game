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

    // For iOS Safari, we need to use the GLB directly with rel="ar"
    const baseURL = window.location.origin;
    const fullModelPath = modelPath.startsWith('/') ? modelPath : `/${modelPath}`;
    const modelURL = `${baseURL}${fullModelPath}`;
    
    // Create invisible anchor element to trigger AR Quick Look
    const anchor = document.createElement('a');
    anchor.setAttribute('rel', 'ar');
    anchor.setAttribute('href', modelURL);
    anchor.style.display = 'none';
    
    // Add to DOM, click, and remove
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => document.body.removeChild(anchor), 100);
  }

  isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
}

// Available drum kit models for AR
export const DRUM_MODELS = {
  drum: '/models/Drum.glb',
  cymbal: '/models/Cymbal.glb',
  drumstick: '/models/Drum stick.glb',
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