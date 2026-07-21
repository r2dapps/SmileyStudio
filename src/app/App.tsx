import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { AudioErrorBoundary } from '../components/AudioErrorBoundary';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AudioErrorBoundary>
        <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-white max-w-lg mx-auto relative shadow-2xl pb-16">
          <Header />
          
          <main className="flex-1 p-4 overflow-y-auto">
            <AppRoutes />
          </main>

          <BottomNav />
        </div>
      </AudioErrorBoundary>
    </HashRouter>
  );
};
