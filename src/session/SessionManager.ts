import { StudioState } from '../core/StudioController';

const SESSION_STORAGE_KEY = 'SmileyStudio_Session_Draft';

export class SessionManager {
  public static saveSession(state: Partial<StudioState>): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Session save failed:', e);
    }
  }

  public static loadSession(): Partial<StudioState> | null {
    try {
      const data = localStorage.getItem(SESSION_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  public static clearSession(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}
