export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isIPhone = () => {
  return /iPhone/.test(navigator.userAgent);
};

export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

export const isMobile = () => {
  return isIOS() || isAndroid() || /Mobile|Tablet/.test(navigator.userAgent);
};

export const supportsARQuickLook = () => {
  return isIOS() && 'webkitGetUserMedia' in navigator;
};

export const supportsDeviceOrientation = () => {
  return 'DeviceOrientationEvent' in window;
};