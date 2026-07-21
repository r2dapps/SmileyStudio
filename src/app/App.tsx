import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { AudioErrorBoundary } from '../components/AudioErrorBoundary';
import { AppRoutes } from './routes';
import { useStudioStore } from '../store/useStudioStore';

export const App: React.FC = () => {
  const appTheme = useStudioStore((state) => state.appTheme);

  return (
    <HashRouter>
      <AudioErrorBoundary>
        <div className={`theme-${appTheme} h-screen w-full max-w-lg mx-auto flex flex-col justify-between bg-slate-950 text-white relative shadow-2xl overflow-hidden font-sans`}>
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
