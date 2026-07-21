import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { StudioPage } from '../pages/StudioPage';
import { FXRackPage } from '../pages/FXRackPage';
import { TracksPage } from '../pages/TracksPage';
import { VaultPage } from '../pages/VaultPage';
import { PracticePage } from '../pages/PracticePage';
import { SettingsPage } from '../pages/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<StudioPage />} />
      <Route path="/fx" element={<FXRackPage />} />
      <Route path="/tracks" element={<TracksPage />} />
      <Route path="/vault" element={<VaultPage />} />
      <Route path="/practice" element={<PracticePage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
};
