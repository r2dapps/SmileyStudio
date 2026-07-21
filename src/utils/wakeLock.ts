export class WakeLockManager {
  private static sentinel: any = null;

  public static async requestWakeLock(): Promise<boolean> {
    if ('wakeLock' in navigator) {
      try {
        WakeLockManager.sentinel = await (navigator as any).wakeLock.request('screen');
        return true;
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
      }
    }
    return false;
  }

  public static async releaseWakeLock(): Promise<void> {
    if (WakeLockManager.sentinel) {
      try {
        await WakeLockManager.sentinel.release();
        WakeLockManager.sentinel = null;
      } catch (err) {
        console.warn('Wake Lock release failed:', err);
      }
    }
  }
}
