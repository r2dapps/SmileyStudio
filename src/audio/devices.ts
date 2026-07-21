export interface AudioDeviceInfo {
  deviceId: string;
  label: string;
  groupId: string;
}

export class DeviceManager {
  public async getAudioInputs(): Promise<AudioDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === 'audioinput')
      .map((d, index) => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone ${index + 1}`,
        groupId: d.groupId,
      }));
  }

  public onDeviceChange(callback: () => void): () => void {
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', callback);
      return () => navigator.mediaDevices.removeEventListener('devicechange', callback);
    }
    return () => {};
  }
}

export const deviceManager = new DeviceManager();
