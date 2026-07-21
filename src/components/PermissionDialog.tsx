import React from 'react';
import { MicOff, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export const PermissionDialog: React.FC<Props> = ({ isOpen, onRetry, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glassmorphism p-6 rounded-2xl max-w-sm w-full space-y-4 border border-pink-500/30 text-center">
        <div className="w-12 h-12 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto border border-pink-500/30">
          <MicOff className="w-6 h-6" />
        </div>

        <h3 className="text-sm font-bold text-white">Microphone Access Needed</h3>
        
        <p className="text-xs text-slate-300 leading-relaxed">
          Smiley Studio requires microphone access to display real-time pitch feedback and record vocals.
        </p>

        <div className="p-3 bg-slate-900/60 rounded-xl text-[11px] text-slate-400 text-left space-y-1 border border-slate-800">
          <div className="flex items-center space-x-1.5 font-bold text-slate-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>How to allow:</span>
          </div>
          <p>1. Tap the lock/mic icon in browser address bar.</p>
          <p>2. Select "Allow Microphone".</p>
          <p>3. Tap Try Again below.</p>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold active:scale-95 transition shadow-lg shadow-pink-600/30"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
