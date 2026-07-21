import React, { useEffect, useState } from 'react';
import { RecordingsRepository, RecordingMetadata } from '../db/recordings';
import { BlobStorage } from '../db/blobStorage';
import { ExportManager } from '../audio/recorder/ExportManager';
import { BlobManager } from '../audio/recorder/BlobManager';
import { FolderHeart, Play, Download, Trash2, Share2, Archive, Video, SwitchCamera, FlipHorizontal, Film } from 'lucide-react';
import { soundEffects } from '../utils/audioFeedback';

// Map saved aspect ratio to a CSS class for the video player container
const ASPECT_CLASSES: Record<string, string> = {
  '9:16': 'aspect-[9/16] max-h-[480px]',
  '1:1': 'aspect-square max-h-[320px]',
  '4:5': 'aspect-[4/5] max-h-[380px]',
  '16:9': 'aspect-video',
};

export const VaultPage: React.FC = () => {
  const [recordings, setRecordings] = useState<RecordingMetadata[]>([]);
  const [activeMediaUrl, setActiveMediaUrl] = useState<{ id: number; url: string; isVideo?: boolean } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

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
    if (activeMediaUrl && activeMediaUrl.id === item.id) {
      BlobManager.revokeURL(activeMediaUrl.url);
      setActiveMediaUrl(null);
      return;
    }

    const blob = await BlobStorage.getBlob(item.blobId);
    if (blob) {
      if (activeMediaUrl) BlobManager.revokeURL(activeMediaUrl.url);
      const url = BlobManager.createURL(blob);
      setActiveMediaUrl({ id: item.id, url, isVideo: item.isVideo });
    }
  };

  const handleShare = async (item: RecordingMetadata) => {
    soundEffects.playClickChime();
    const blob = await BlobStorage.getBlob(item.blobId);
    if (!blob) return;
    const cleanName = item.title.replace(/[^a-z0-9]/gi, '_');
    const ok = await ExportManager.shareTake(blob, cleanName, item.isVideo ? 'video' : 'audio');
    if (ok) showToast(item.isVideo ? '📽 Video shared!' : '🎵 Audio shared!');
  };

  const handleExport = async (item: RecordingMetadata) => {
    soundEffects.playClickChime();
    const blob = await BlobStorage.getBlob(item.blobId);
    if (!blob) return;
    const cleanName = item.title.replace(/[^a-z0-9]/gi, '_');
    await ExportManager.exportTake(blob, cleanName, item.isVideo ? 'video' : 'audio');
    showToast(item.isVideo ? '⬇ MP4 downloading…' : '⬇ WAV downloading…');
  };

  const handleBackupExport = () => {
    soundEffects.playClickChime();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(recordings, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `Smiley_Studio_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDelete = async (item: RecordingMetadata) => {
    soundEffects.playClickChime();
    if (!item.id) return;
    if (activeMediaUrl && activeMediaUrl.id === item.id) {
      BlobManager.revokeURL(activeMediaUrl.url);
      setActiveMediaUrl(null);
    }
    await RecordingsRepository.deleteRecording(item.id, item.blobId);
    await loadRecordings();
  };

  return (
    <div className="space-y-4 pb-20 relative">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <h1 className="text-base font-bold flex items-center space-x-2">
            <FolderHeart className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <span>My Recorded Songs</span>
          </h1>
          <p className="text-xs text-slate-400">Audio (WAV) &amp; Video (MP4) Takes · Share &amp; Download</p>
        </div>
        {recordings.length > 0 && (
          <button
            onClick={handleBackupExport}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-1 border border-slate-700 transition"
            title="Export Backup (.json)"
          >
            <Archive className="w-3.5 h-3.5 text-purple-400" />
            <span>Backup</span>
          </button>
        )}
      </div>

      <div className="glassmorphism p-4 rounded-2xl space-y-3 border border-slate-800">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
          <span className="flex items-center space-x-1.5">
            <FolderHeart className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span>Song Library</span>
          </span>
          <span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>{recordings.length} Takes</span>
        </div>

        {recordings.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-slate-500 italic">No recorded songs or videos in your library yet.</p>
            <p className="text-[11px] text-slate-600">Tap Record in the Studio tab to capture Smiley's performances!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[68vh] overflow-y-auto pr-1">
            {recordings.map((item) => {
              const isActive = activeMediaUrl?.id === item.id;
              const aspectClass = item.aspectRatio ? ASPECT_CLASSES[item.aspectRatio] : 'aspect-video';
              const isPortrait = item.aspectRatio === '9:16' || item.aspectRatio === '4:5';

              return (
                <div key={item.id} className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 space-y-2">
                  {/* Title row */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5 truncate">
                        {item.isVideo
                          ? <Video className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          : <span className="text-pink-400 shrink-0">🎙</span>
                        }
                        <span className="truncate">{item.title}</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono flex flex-wrap gap-x-2 mt-0.5">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>{item.duration}s</span>
                        {item.isVideo && item.aspectRatio && (
                          <>
                            <span>·</span>
                            <span className="flex items-center space-x-0.5">
                              <Film className="w-3 h-3" />
                              <span>{item.aspectRatio}</span>
                            </span>
                          </>
                        )}
                        {item.isVideo && item.cameraFacing && (
                          <>
                            <span>·</span>
                            <span className="flex items-center space-x-0.5">
                              {item.cameraFacing === 'user'
                                ? <FlipHorizontal className="w-3 h-3" />
                                : <SwitchCamera className="w-3 h-3" />
                              }
                              <span>{item.cameraFacing === 'user' ? 'Selfie' : 'Rear'}</span>
                            </span>
                          </>
                        )}
                        {item.filterName && (
                          <>
                            <span>·</span>
                            <span>{item.filterName}</span>
                          </>
                        )}
                        {item.presetName && (
                          <>
                            <span>·</span>
                            <span>{item.presetName}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1 text-slate-500 hover:text-red-400 transition shrink-0 ml-2"
                      title="Delete Take"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Media player — correct aspect ratio for video */}
                  {isActive && (
                    item.isVideo ? (
                      <div className={`w-full ${isPortrait ? 'flex justify-center' : ''}`}>
                        <div className={`${isPortrait ? 'w-auto h-full max-w-[240px]' : 'w-full'} ${aspectClass} rounded-xl overflow-hidden bg-black border border-slate-700`}>
                          <video
                            src={activeMediaUrl!.url}
                            controls
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                            style={{
                              transform: item.cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
                            }}
                          />
                        </div>
                        {item.cameraFacing === 'user' && (
                          <p className="text-[9px] text-slate-500 text-center mt-1 flex items-center justify-center space-x-1">
                            <FlipHorizontal className="w-3 h-3" />
                            <span>Mirror preserved from recording</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <audio src={activeMediaUrl!.url} controls autoPlay className="w-full h-8 opacity-90 rounded-lg" />
                    )
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handlePlay(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 hover:opacity-80 transition border"
                      style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isActive ? 'Stop' : 'Play Take'}</span>
                    </button>

                    <button
                      onClick={() => handleShare(item)}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 active:scale-95 transition shadow-lg shadow-purple-600/20"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Track</span>
                    </button>

                    <button
                      onClick={() => handleExport(item)}
                      className="px-2.5 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center space-x-1 hover:text-white transition"
                    >
                      <Download className="w-3 h-3 text-purple-400" />
                      <span>{item.isVideo ? '⬇ MP4' : '⬇ WAV'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
