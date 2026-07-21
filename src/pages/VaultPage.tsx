import React, { useEffect, useState } from 'react';
import { RecordingsRepository, RecordingMetadata } from '../db/recordings';
import { BlobStorage } from '../db/blobStorage';
import { ExportManager } from '../audio/recorder/ExportManager';
import { BlobManager } from '../audio/recorder/BlobManager';
import { FolderHeart, Play, Download, Trash2, Share2, Archive } from 'lucide-react';
import { soundEffects } from '../utils/audioFeedback';

export const VaultPage: React.FC = () => {
  const [recordings, setRecordings] = useState<RecordingMetadata[]>([]);
  const [activeAudioUrl, setActiveAudioUrl] = useState<{ id: number; url: string } | null>(null);

  const loadRecordings = async () => {
    try {
      const list = await RecordingsRepository.getAllRecordings();
      setRecordings(list.reverse());
    } catch (e) {
      console.error('Failed to load recordings:', e);
    }
  };

  useEffect(() => {
    loadRecordings();
  }, []);

  const handlePlay = async (item: RecordingMetadata) => {
    soundEffects.playClickChime();
    if (!item.id) return;
    if (activeAudioUrl && activeAudioUrl.id === item.id) {
      BlobManager.revokeURL(activeAudioUrl.url);
      setActiveAudioUrl(null);
      return;
    }

    const blob = await BlobStorage.getBlob(item.blobId);
    if (blob) {
      if (activeAudioUrl) BlobManager.revokeURL(activeAudioUrl.url);
      const url = BlobManager.createURL(blob);
      setActiveAudioUrl({ id: item.id, url });
    }
  };

  const handleShare = async (item: RecordingMetadata) => {
    soundEffects.playClickChime();
    const blob = await BlobStorage.getBlob(item.blobId);
    if (blob) {
      const cleanName = item.title.replace(/[^a-z0-9]/gi, '_');
      await ExportManager.shareTake(blob, cleanName, 'wav');
    }
  };

  const handleExport = async (item: RecordingMetadata, format: 'wav' | 'webm') => {
    soundEffects.playClickChime();
    const blob = await BlobStorage.getBlob(item.blobId);
    if (blob) {
      const cleanName = item.title.replace(/[^a-z0-9]/gi, '_');
      await ExportManager.exportTake(blob, cleanName, format);
    }
  };

  const handleBackupExport = () => {
    soundEffects.playClickChime();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recordings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Smiley_Studio_Backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDelete = async (item: RecordingMetadata) => {
    soundEffects.playClickChime();
    if (!item.id) return;
    if (activeAudioUrl && activeAudioUrl.id === item.id) {
      BlobManager.revokeURL(activeAudioUrl.url);
      setActiveAudioUrl(null);
    }
    await RecordingsRepository.deleteRecording(item.id, item.blobId);
    await loadRecordings();
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <h1 className="text-base font-bold flex items-center space-x-2">
            <FolderHeart className="w-5 h-5 text-pink-400" />
            <span>My Recorded Songs</span>
          </h1>
          <p className="text-xs text-slate-400">Recorded Takes, File Sharing & Multi-Format Exports</p>
        </div>

        {recordings.length > 0 && (
          <button
            onClick={handleBackupExport}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-1 border border-slate-700 transition"
            title="Export Song Library Backup (.json)"
          >
            <Archive className="w-3.5 h-3.5 text-purple-400" />
            <span>Backup</span>
          </button>
        )}
      </div>

      <div className="glassmorphism p-4 rounded-2xl space-y-3 border border-slate-800">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
          <span className="flex items-center space-x-1.5">
            <FolderHeart className="w-4 h-4 text-pink-400" />
            <span>Song Library</span>
          </span>
          <span className="text-[10px] text-pink-400 font-mono">{recordings.length} Songs</span>
        </div>

        {recordings.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-slate-500 italic">No recorded songs in your library yet.</p>
            <p className="text-[11px] text-slate-600">Tap Record in the Studio tab to capture Smiley's songs!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {recordings.map((item) => (
              <div key={item.id} className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">{item.title}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()} &bull; Preset: {item.presetName} &bull; {item.duration}s
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1 text-slate-500 hover:text-red-400 transition"
                    title="Delete Song"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {activeAudioUrl && activeAudioUrl.id === item.id && (
                  <audio src={activeAudioUrl.url} controls autoPlay className="w-full h-8 opacity-90 rounded-lg" />
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handlePlay(item)}
                    className="px-3 py-1.5 bg-pink-500/20 text-pink-400 border border-pink-500/40 rounded-lg text-xs font-bold flex items-center space-x-1 hover:bg-pink-500/30 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-pink-400" />
                    <span>{activeAudioUrl && activeAudioUrl.id === item.id ? 'Stop' : 'Play'}</span>
                  </button>

                  <button
                    onClick={() => handleShare(item)}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 active:scale-95 transition shadow-lg shadow-purple-600/30"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Track</span>
                  </button>

                  <button
                    onClick={() => handleExport(item, 'wav')}
                    className="px-2.5 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center space-x-1 hover:text-white transition"
                  >
                    <Download className="w-3 h-3 text-purple-400" />
                    <span>WAV</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
