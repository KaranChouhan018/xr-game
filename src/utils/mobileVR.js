import * as THREE from 'three';

export class MobileVRSimulator {
  constructor(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.isActive = false;
    this.deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
    this.screenOrientation = window.orientation || 0;
    
    // Bind event handlers
    this.handleDeviceOrientation = this.handleDeviceOrientation.bind(this);
    this.handleOrientationChange = this.handleOrientationChange.bind(this);
  }

  async requestPermissions() {
    // Request device orientation permissions on iOS 13+
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Permission request failed:', error);
        return false;
      }
    }
    return true; // Permissions not needed on other devices
  }

  async start() {
    if (this.isActive) return;

    // Request permissions if needed
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Device orientation permission denied');
    }

    // Set up mobile VR mode
    this.setupMobileVR();
    
    // Add event listeners
    window.addEventListener('deviceorientation', this.handleDeviceOrientation, true);
    window.addEventListener('orientationchange', this.handleOrientationChange, false);
    
    this.isActive = true;
  }

  stop() {
    if (!this.isActive) return;

    // Remove event listeners
    window.removeEventListener('deviceorientation', this.handleDeviceOrientation, true);
    window.removeEventListener('orientationchange', this.handleOrientationChange, false);
    
    // Reset camera
    this.camera.rotation.set(0, 0, 0);
    
    this.isActive = false;
  }

  setupMobileVR() {
    // Enter fullscreen
    if (this.renderer.domElement.requestFullscreen) {
      this.renderer.domElement.requestFullscreen();
    } else if (this.renderer.domElement.webkitRequestFullscreen) {
      this.renderer.domElement.webkitRequestFullscreen();
    }

    // Lock orientation to landscape
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(console.warn);
    }

    // Adjust camera for VR-like experience
    this.camera.fov = 80; // Wider FOV for immersive feel
    this.camera.updateProjectionMatrix();
  }

  handleDeviceOrientation(event) {
    if (!this.isActive) return;

    this.deviceOrientation.alpha = event.alpha || 0;
    this.deviceOrientation.beta = event.beta || 0;
    this.deviceOrientation.gamma = event.gamma || 0;

    this.updateCameraRotation();
  }

  handleOrientationChange() {
    this.screenOrientation = window.orientation || 0;
  }

  updateCameraRotation() {
    const { alpha, beta, gamma } = this.deviceOrientation;
    
    // Convert device orientation to camera rotation
    const euler = new THREE.Euler();
    
    // Apply device orientation (in radians)
    euler.set(
      THREE.MathUtils.degToRad(beta - 90), // Pitch
      THREE.MathUtils.degToRad(alpha),     // Yaw
      -THREE.MathUtils.degToRad(gamma),    // Roll
      'YXZ'
    );

    // Adjust for screen orientation
    if (this.screenOrientation !== 0) {
      euler.z += THREE.MathUtils.degToRad(this.screenOrientation);
    }

    this.camera.rotation.copy(euler);
  }

  // Check if device supports gyroscope VR
  static isSupported() {
    return 'DeviceOrientationEvent' in window && 
           /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
  }
}

// Utility function to initialize mobile VR
export const initMobileVR = (camera, renderer) => {
  return new MobileVRSimulator(camera, renderer);
};