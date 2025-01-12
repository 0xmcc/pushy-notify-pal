export const isIOSSafari = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
         /WebKit/.test(navigator.userAgent) &&
         !/(CriOS|FxiOS|OPiOS|mercury)/.test(navigator.userAgent);
  
  // Debug logging for actual device
  if (isIOS) {
    console.log('iOS Safari detected');
    console.log('Is standalone PWA:', window.navigator.standalone);
    console.log('window.safari:', window.safari);
    console.log('pushNotification:', window.safari?.pushNotification);
    console.log('isPWA:', isPWA());
    console.log('isWebPushSupported:', isWebPushSupported());
  }
  
  return isIOS;
};

export const isPWA = () => {
  return window.navigator.standalone === true;
};

export const isWebPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}; 