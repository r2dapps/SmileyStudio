import React, { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { AudioErrorBoundary } from '../components/AudioErrorBoundary';
import { AppRoutes } from './routes';
import { useStudioStore } from '../store/useStudioStore';

export const App: React.FC = () => {
  const appTheme = useStudioStore((state) => state.appTheme);

  // Lock screen orientation to portrait on mobile to prevent auto-rotation
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('portrait');
        }
      } catch (e) {
        // Silently ignored — desktop browsers don't support orientation lock
      }
    };
    lockOrientation();
  }, []);

  return (
    <HashRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AudioErrorBoundary>
        {/* Responsive outer wrapper: full-screen on mobile, centered card on desktop */}
        <div
          className={`theme-${appTheme} min-h-screen w-full flex items-center justify-center transition-colors duration-300`}
          style={{ backgroundColor: 'var(--bg-main)' }}
        >
          <div
            className="w-full h-screen sm:h-[90vh] sm:max-w-md sm:rounded-3xl sm:shadow-2xl flex flex-col overflow-hidden relative"
            style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-accent)' }}
          >
            <Header />

            <main className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
              <AppRoutes />
            </main>

            <BottomNav />
          </div>
        </div>
      </AudioErrorBoundary>
    </HashRouter>
  );
};
