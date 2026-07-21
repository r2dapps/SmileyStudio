import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { AudioErrorBoundary } from '../components/AudioErrorBoundary';
import { AppRoutes } from './routes';
import { useStudioStore } from '../store/useStudioStore';
import { useEffect } from 'react';

export const App: React.FC = () => {
  const appTheme = useStudioStore((state) => state.appTheme);

  // Lock screen orientation to portrait to prevent auto-rotation
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('portrait');
        }
      } catch (e) {
        // Silently ignore — desktop browsers don't support orientation lock
      }
    };
    lockOrientation();
  }, []);

  return (
    <HashRouter>
      <AudioErrorBoundary>
        <div
          className={`theme-${appTheme} h-screen w-full max-w-lg mx-auto flex flex-col justify-between text-white relative shadow-2xl overflow-hidden font-sans transition-all duration-300`}
          style={{ backgroundColor: 'var(--bg-main)' }}
        >
          <Header />

          <main className="flex-1 overflow-y-auto p-3 sm:p-4 pb-4">
            <AppRoutes />
          </main>

          <BottomNav />
        </div>
      </AudioErrorBoundary>
    </HashRouter>
  );
};
