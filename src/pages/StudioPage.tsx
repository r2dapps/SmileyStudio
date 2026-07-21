import React, { useState, useRef, useEffect } from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { WaveformCanvas } from '../components/visualizers/WaveformCanvas';
import { PWAInstaller } from '../components/PWAInstaller';
import { Disc, Headphones, Mic, Sliders, Radio, Wand2, Flame, AlertCircle, X, Camera, RefreshCw, Video, Film, Bookmark, Maximize2, Minimize2, ChevronDown, ChevronUp, Crop } from 'lucide-react';
import { soundEffects } from '../utils/audioFeedback';
import { VIDEO_FILTERS, VideoFilterOption } from '../utils/videoFilters';
import { VideoRecorderManager } from '../audio/recorder/VideoRecorder';
import { audioEngine } from '../audio/engine';
import { RecordingsRepository } from '../db/recordings';

export const StudioPage: React.FC = () => {
  const [studioMode, setStudioMode] = useState<'audio' | 'video'>('audio');
  
  // Audio state
  const isMicActive = useStudioStore((state) => state.isMicActive);
  const isRecording = useStudioStore((state) => state.isRecording);
  const liveMonitor = useStudioStore((state) => state.liveMonitor);
  const micError = useStudioStore((state) => state.micError);
  const activePresetId = useStudioStore((state) => state.activePresetId);
  const customPresets = useStudioStore((state) => state.customPresets);
  const detectedNote = useStudioStore((state) => state.detectedNote);
  const toggleLiveMonitor = useStudioStore((state) => state.toggleLiveMonitor);
  const toggleRecording = useStudioStore((state) => state.toggleRecording);
  const clearMicError = useStudioStore((state) => state.clearMicError);
  const setPreset = useStudioStore((state) => state.setPreset);

  // Video state
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [selectedFilter, setSelectedFilter] = useState<VideoFilterOption>(VIDEO_FILTERS[0]);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '4:5' | '16:9'>('9:16');
  const [isCleanPreview, setIsCleanPreview] = useState<boolean>(false);
  const [showVideoFilters, setShowVideoFilters] = useState<boolean>(true);
  const [showVoicePresets, setShowVoicePresets] = useState<boolean>(true);
  const [isVideoRecording, setIsVideoRecording] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const videoRecorderRef = useRef<VideoRecorderManager>(new VideoRecorderManager());
  const videoStartTimeRef = useRef<number>(0);

  const builtInPresets = [
    { id: 'popLead', label: 'Pop Lead Polish', icon: Mic, color: 'text-pink-400' },
    { id: 'warmth', label: 'Acoustic Warmth', icon: Flame, color: 'text-amber-400' },
    { id: 'pitchAssist', label: 'Pitch Snap Assist', icon: Wand2, color: 'text-purple-400' },
    { id: 'lofi', label: 'Lo-Fi Vibe', icon: Headphones, color: 'text-cyan-400' },
    { id: 'radio', label: 'Vintage Radio', icon: Radio, color: 'text-emerald-400' },
    { id: 'bypass', label: 'Raw Dry Voice', icon: Sliders, color: 'text-slate-400' },
  ];

  const aspectClasses = {
    '9:16': 'aspect-[9/16] max-h-[480px]',
    '1:1': 'aspect-square max-h-[360px]',
    '4:5': 'aspect-[4/5] max-h-[400px]',
    '16:9': 'aspect-video max-h-[280px]',
  };

  useEffect(() => {
    if (studioMode === 'video') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [studioMode, cameraFacing]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (e: any) {
      console.error('Camera access failed:', e);
      setCameraError('Camera permission denied or camera unavailable.');
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  };

  const handleFlipCamera = () => {
    soundEffects.playClickChime();
    setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleSelectFilter = (filter: VideoFilterOption) => {
    soundEffects.playPresetChime();
    setSelectedFilter(filter);
  };

  const handleToggleVideoRecord = async () => {
    soundEffects.playClickChime();

    if (!isVideoRecording) {
      try {
        await audioEngine.start();
        const graph = audioEngine.getGraph();
        if (!graph || !cameraStreamRef.current) {
          alert('Please enable camera and mic permissions to record video performance.');
          return;
        }

        const audioCtx = graph.outputNode.context as AudioContext;
        const audioDest = audioCtx.createMediaStreamDestination();
        graph.outputNode.connect(audioDest);

        const videoTrack = cameraStreamRef.current.getVideoTracks()[0];
        const audioTrack = audioDest.stream.getAudioTracks()[0];
        const combinedStream = new MediaStream([videoTrack, audioTrack]);

        videoRecorderRef.current.startRecording(combinedStream);
        videoStartTimeRef.current = Date.now();
        setIsVideoRecording(true);
      } catch (err) {
        console.error('Failed to start video recording:', err);
      }
    } else {
      try {
        const videoBlob = await videoRecorderRef.current.stopRecording();
        const duration = Math.round((Date.now() - videoStartTimeRef.current) / 1000);
        const title = `Smiley Video Reel ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const blobId = `blob_vid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        await RecordingsRepository.saveRecording(
          {
            title,
            createdAt: new Date().toISOString(),
            duration,
            sampleRate: 44100,
            appVersion: '1.0.0',
            presetVersion: '1.0',
            presetName: activePresetId,
            format: 'webm',
            favorite: false,
            notes: '',
            blobId,
            isVideo: true,
            filterName: selectedFilter.name,
          },
          videoBlob
        );
      } catch (e) {
        console.error('Failed to save video take:', e);
      } finally {
        setIsVideoRecording(false);
        if (!liveMonitor) {
          audioEngine.stop();
        }
      }
    }
  };

  const handleSelectPreset = (id: string) => {
    soundEffects.playPresetChime();
    setPreset(id);
  };

  const handleToggleRecord = () => {
    soundEffects.playClickChime();
    toggleRecording();
  };

  const handleToggleMonitor = () => {
    soundEffects.playClickChime();
    toggleLiveMonitor();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* PWA Home Screen Install Banner */}
      <PWAInstaller />

      {/* Mode Switcher: Audio Mode / Video Studio Mode */}
      <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
        <button
          onClick={() => {
            soundEffects.playClickChime();
            setStudioMode('audio');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition ${
            studioMode === 'audio'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Audio Studio Mode</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playClickChime();
            setStudioMode('video');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition ${
            studioMode === 'video'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Video Reel Mode</span>
        </button>
      </div>

      {/* Mic Access Error Banner */}
      {micError && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center justify-between text-xs text-red-200 animate-fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{micError}</span>
          </div>
          <button onClick={() => clearMicError()} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- VIDEO STUDIO REEL MODE --- */}
      {studioMode === 'video' ? (
        <div className="space-y-4">
          {/* Top Aspect Ratio & Clean Preview Bar */}
          <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center space-x-1">
              <Crop className="w-3.5 h-3.5 text-pink-400 mr-1" />
              {(['9:16', '1:1', '4:5', '16:9'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => {
                    soundEffects.playClickChime();
                    setAspectRatio(ratio);
                  }}
                  className={`px-2 py-1 rounded-lg font-bold transition text-[11px] ${
                    aspectRatio === ratio
                      ? 'bg-pink-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {ratio === '9:16' ? 'Reel 9:16' : ratio}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                soundEffects.playClickChime();
                setIsCleanPreview(!isCleanPreview);
              }}
              className={`p-1.5 rounded-xl border flex items-center space-x-1 font-bold text-[11px] transition ${
                isCleanPreview
                  ? 'bg-pink-500/20 text-pink-400 border-pink-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Toggle Clean Viewfinder Preview"
            >
              {isCleanPreview ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isCleanPreview ? 'Show UI' : 'Clean View'}</span>
            </button>
          </div>

          {/* Live Camera Viewfinder with Realtime Video Filter */}
          <div className={`relative w-full ${aspectClasses[aspectRatio]} glassmorphism rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-pink-500/30 bg-black transition-all duration-300 mx-auto`}>
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transition-all duration-300"
              style={{ filter: selectedFilter.cssFilter }}
            />

            {cameraError && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center space-y-2 z-20">
                <Camera className="w-8 h-8 text-pink-400 animate-pulse" />
                <p className="text-xs text-slate-300 font-semibold">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="px-3 py-1.5 bg-pink-600 text-white text-xs font-bold rounded-xl"
                >
                  Retry Camera
                </button>
              </div>
            )}

            {/* Video Viewfinder Overlays */}
            {!isCleanPreview && (
              <>
                <div className="absolute top-2.5 left-3 text-[10px] uppercase font-bold text-slate-200 tracking-widest flex items-center space-x-1 z-10 bg-black/60 px-2 py-1 rounded-md">
                  <span className={`w-2 h-2 rounded-full ${isVideoRecording ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                  <span>{isVideoRecording ? 'REC Performance' : `${selectedFilter.name} (${aspectRatio})`}</span>
                </div>

                <button
                  onClick={handleFlipCamera}
                  className="absolute top-2.5 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition border border-white/20 z-10"
                  title="Flip Camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <div className="absolute bottom-2.5 right-3 text-xs font-mono bg-black/70 px-2.5 py-1 rounded-md text-pink-400 border border-pink-500/30 z-10">
                  Detected Pitch: <span className="font-bold text-white">{detectedNote}</span>
                </div>
              </>
            )}
          </div>

          {/* Collapsible Visual Video Filters Cards */}
          {!isCleanPreview && (
            <section className="space-y-2">
              <button
                onClick={() => setShowVideoFilters(!showVideoFilters)}
                className="w-full text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between py-1"
              >
                <span className="flex items-center space-x-1.5">
                  <Film className="w-4 h-4 text-pink-400" />
                  <span>Visual Video Filters</span>
                </span>
                {showVideoFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showVideoFilters && (
                <div className="grid grid-cols-3 gap-2 animate-fade-in">
                  {VIDEO_FILTERS.map((filter) => {
                    const isSelected = selectedFilter.id === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => handleSelectFilter(filter)}
                        className={`p-2.5 rounded-xl glass-card text-xs font-semibold flex flex-col items-center gap-1 transition active:scale-95 ${
                          isSelected ? 'border-pink-500 text-white bg-pink-500/20 shadow-lg shadow-pink-500/20' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Film className={`w-4 h-4 ${isSelected ? 'text-pink-400' : 'text-slate-500'}`} />
                        <span className="text-[11px] text-center leading-tight">{filter.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Collapsible Vocal Voice Presets for Video */}
          {!isCleanPreview && (
            <section className="space-y-2">
              <button
                onClick={() => setShowVoicePresets(!showVoicePresets)}
                className="w-full text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between py-1"
              >
                <span className="flex items-center space-x-1.5">
                  <Mic className="w-4 h-4 text-purple-400" />
                  <span>Vocal Voice Presets for Video</span>
                </span>
                {showVoicePresets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showVoicePresets && (
                <div className="grid grid-cols-3 gap-2 animate-fade-in">
                  {builtInPresets.map((p) => {
                    const Icon = p.icon;
                    const isSelected = activePresetId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPreset(p.id)}
                        className={`p-2.5 rounded-xl glass-card text-xs font-semibold flex flex-col items-center gap-1 transition active:scale-95 ${
                          isSelected ? 'border-pink-500 text-white bg-pink-500/10' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${p.color}`} />
                        <span className="text-[11px] text-center leading-tight">{p.label}</span>
                      </button>
                    );
                  })}

                  {customPresets.map((p) => {
                    const isSelected = activePresetId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPreset(p.id)}
                        className={`p-2.5 rounded-xl glass-card text-xs font-semibold flex flex-col items-center gap-1 transition active:scale-95 ${
                          isSelected ? 'border-purple-500 text-white bg-purple-500/10' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 text-purple-400" />
                        <span className="text-[11px] text-center leading-tight truncate max-w-full">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Video Recording & Live Ear Monitor Controls */}
          <section className="space-y-3 pt-1">
            <button
              onClick={handleToggleVideoRecord}
              className={`w-full p-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition shadow-xl ${
                isVideoRecording
                  ? 'bg-red-600 text-white animate-pulse border border-red-400'
                  : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-pink-600/30'
              }`}
            >
              <Video className="w-6 h-6" />
              <span className="text-sm font-black uppercase tracking-wider">
                {isVideoRecording ? 'Stop Video Performance' : 'Record Video Performance'}
              </span>
            </button>

            <div className="flex justify-center">
              <button
                onClick={handleToggleMonitor}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 border ${
                  liveMonitor
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{liveMonitor ? 'Live Ear Monitor (On)' : 'Live Ear Monitor (Off)'}</span>
              </button>
            </div>
          </section>
        </div>
      ) : (
        /* --- AUDIO STUDIO MODE --- */
        <div className="space-y-4">
          {/* Realtime Spectrum & Visualizer Container */}
          <div className="relative w-full h-36 glassmorphism rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-pink-500/20">
            <WaveformCanvas />
            <div className="absolute top-2.5 left-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center space-x-1 z-10">
              <span className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : isMicActive ? 'bg-emerald-500 animate-pulse' : 'bg-pink-500'}`} />
              <span>Realtime Audio Visualizer</span>
            </div>

            {!isMicActive && (
              <div className="text-slate-500 text-xs font-mono italic z-10">
                Click Record Vocal Take below to start singing
              </div>
            )}

            <div className="absolute bottom-2.5 right-3 text-xs font-mono bg-black/70 px-2.5 py-1 rounded-md text-pink-400 border border-pink-500/30 z-10">
              Detected Pitch: <span className="font-bold text-white">{detectedNote}</span>
            </div>
          </div>

          {/* Preset Voice Modes */}
          <section className="space-y-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
              <span>Preset Voice Modes</span>
              <span className="text-pink-400 font-normal">DSP Studio Presets</span>
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {builtInPresets.map((p) => {
                const Icon = p.icon;
                const isSelected = activePresetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p.id)}
                    className={`p-3 rounded-xl glass-card text-xs font-semibold flex flex-col items-center gap-1.5 active:scale-95 transition ${
                      isSelected ? 'border-pink-500 text-white bg-pink-500/10' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${p.color}`} />
                    <span className="text-[11px] text-center leading-tight">{p.label}</span>
                  </button>
                );
              })}

              {customPresets.map((p) => {
                const isSelected = activePresetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p.id)}
                    className={`p-3 rounded-xl glass-card text-xs font-semibold flex flex-col items-center gap-1.5 active:scale-95 transition ${
                      isSelected ? 'border-purple-500 text-white bg-purple-500/10' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Bookmark className="w-5 h-5 text-purple-400" />
                    <span className="text-[11px] text-center leading-tight truncate max-w-full">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Main Recording & Ear Monitor Controls */}
          <section className="space-y-3 pt-2">
            <button
              onClick={handleToggleRecord}
              className={`w-full p-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition shadow-xl ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse border border-red-400'
                  : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-pink-600/30'
              }`}
            >
              <Disc className="w-6 h-6" />
              <span className="text-sm font-black uppercase tracking-wider">
                {isRecording ? 'Stop Recording' : 'Record Vocal Take'}
              </span>
            </button>

            <div className="flex justify-center">
              <button
                onClick={handleToggleMonitor}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 border ${
                  liveMonitor
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{liveMonitor ? 'Live Ear Monitor (On)' : 'Live Ear Monitor (Off)'}</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
