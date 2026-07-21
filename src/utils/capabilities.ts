export interface Capabilities {
  supportsWakeLock: boolean;
  supportsAudioWorklet: boolean;
  supportsWavExport: boolean;
  supportsBluetooth: boolean;
  supportsFileSystemAccess: boolean;
  isSafari: boolean;
  isIOS: boolean;
}

export function detectCapabilities(): Capabilities {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  return {
    supportsWakeLock: 'wakeLock' in navigator,
    supportsAudioWorklet: typeof AudioContext !== 'undefined' && 'audioWorklet' in AudioContext.prototype,
    supportsWavExport: true, // Managed natively via AudioBuffer conversion
    supportsBluetooth: 'bluetooth' in navigator,
    supportsFileSystemAccess: 'showOpenFilePicker' in window,
    isSafari,
    isIOS,
  };
}
