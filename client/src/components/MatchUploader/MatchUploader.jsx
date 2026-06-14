import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileJson, CheckCircle2, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import NeonButton from '../ui/NeonButton';
import ProgressBar from '../ui/ProgressBar';
import { useMatches } from '../../hooks/useMatches';
import { useGameStore } from '../../store/useGameStore';
import { playSynthSound } from '../../lib/sound';

const GAME_SYNC_LABELS = {
  valorant: {
    label: 'Riot ID (Name#Tag)',
    placeholder: 'e.g. TenZ#NA1',
    presets: ['TenZ#NA1', 'Faker#KR1', 'Shroud#NA1'],
    apiName: 'Riot Games API'
  },
  cs2: {
    label: 'Steam Account Name or IGN',
    placeholder: 'e.g. s1mple',
    presets: ['s1mple', 'ZywOo', 'm0NESY'],
    apiName: 'Steam WebAPI'
  },
  lol: {
    label: 'Riot ID / Summoner Name',
    placeholder: 'e.g. Faker#KR1',
    presets: ['Faker#KR1', 'Showmaker#KR2', 'Caps#EUW1'],
    apiName: 'Riot Games League API'
  },
  fortnite: {
    label: 'Epic Games Username',
    placeholder: 'e.g. Ninja',
    presets: ['Ninja', 'Mongraal', 'Bugha'],
    apiName: 'Epic Games Fortnite API'
  },
  pubg: {
    label: 'PUBG In-Game Name (IGN)',
    placeholder: 'e.g. Shroud',
    presets: ['Shroud', 'chocotaco', 'Pio'],
    apiName: 'PUBG Developer API'
  }
};

export default function MatchUploader() {
  const { uploadMatchFile, syncProfileMatches, isLoading } = useMatches();
  const { activeGame } = useGameStore();
  const [activeTab, setActiveTab] = useState('sync'); // 'sync' | 'upload'
  const [playerName, setPlayerName] = useState('');
  
  const [fileDetails, setFileDetails] = useState(null);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const gameConfig = GAME_SYNC_LABELS[activeGame] || GAME_SYNC_LABELS.valorant;

  // File Drop Handler
  const onDrop = useCallback((acceptedFiles) => {
    setError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    
    const file = acceptedFiles[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'json' && ext !== 'csv') {
      setError('Invalid file format. Please upload a structured .json or .csv match log.');
      return;
    }

    setFileDetails({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      rawFile: file
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
    disabled: isLoading
  });

  // Handle Manual Upload
  const handleUploadSubmit = async () => {
    if (!fileDetails?.rawFile) return;

    setError(null);
    setUploadSuccess(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 95) {
        clearInterval(interval);
      } else {
        setUploadProgress(progress);
      }
    }, 100);

    try {
      await uploadMatchFile(fileDetails.rawFile);
      clearInterval(interval);
      setUploadProgress(100);
      setUploadSuccess(true);
      setFileDetails(null);
    } catch (err) {
      clearInterval(interval);
      setUploadProgress(0);
      setError(err.message || 'Verification failed. File structure is corrupted.');
    }
  };

  // Handle Direct Sync
  const handleSyncSubmit = async (forcedName = null) => {
    const targetName = forcedName || playerName;
    if (!targetName.trim()) {
      setError(`Please enter a valid ${gameConfig.label}`);
      return;
    }

    setError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    
    // Step simulation
    const steps = [
      `Initializing handshake with ${gameConfig.apiName}...`,
      `Retrieving telemetry blocks for account: "${targetName}"...`,
      `Decrypting game logs and extracting performance vectors...`,
      `Pushing to Supabase DB and recalculating coaching recommendations...`
    ];

    let currentStep = 0;
    setSyncStatus(steps[0]);
    setUploadProgress(10);

    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setSyncStatus(steps[currentStep]);
        setUploadProgress(25 * (currentStep + 1));
      } else {
        clearInterval(stepInterval);
      }
    }, 700);

    try {
      await syncProfileMatches(targetName);
      clearInterval(stepInterval);
      setUploadProgress(100);
      setUploadSuccess(true);
      setPlayerName('');
    } catch (err) {
      clearInterval(stepInterval);
      setUploadProgress(0);
      setSyncStatus('');
      setError(err.message || 'Synchronization failed. API server is unreachable.');
    }
  };

  return (
    <GlassCard className="w-full flex flex-col gap-6">
      <div className="border-b border-white/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-white">Match History Telemetry</h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyze your performance, track player metrics, and fuel your coaching recommendation engine.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 select-none w-fit">
          <button
            onClick={() => {
              playSynthSound('click');
              setActiveTab('sync');
              setError(null);
              setUploadSuccess(false);
            }}
            onMouseEnter={() => playSynthSound('hover')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 ${
              activeTab === 'sync'
                ? 'bg-[var(--game-accent)] text-black shadow-[0_0_10px_var(--game-glow)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading && activeTab === 'sync' ? 'animate-spin' : ''}`} />
            DIRECT SYNC
          </button>
          <button
            onClick={() => {
              playSynthSound('click');
              setActiveTab('upload');
              setError(null);
              setUploadSuccess(false);
            }}
            onMouseEnter={() => playSynthSound('hover')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-[var(--game-accent)] text-black shadow-[0_0_10px_var(--game-glow)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            FILE UPLOAD
          </button>
        </div>
      </div>

      {/* Sync Profile Tab */}
      {activeTab === 'sync' && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {gameConfig.label}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={gameConfig.placeholder}
                  disabled={isLoading}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                />
                <KeyRound className="absolute right-4 top-3.5 w-4 h-4 text-slate-600" />
              </div>
              <NeonButton
                size="md"
                onClick={() => handleSyncSubmit()}
                isLoading={isLoading}
                className="!py-3"
              >
                SYNC API
              </NeonButton>
            </div>
          </div>

          {/* Quick Presets for Demo */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Quick Load Profiles
            </span>
            <div className="flex flex-wrap gap-2">
              {gameConfig.presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    playSynthSound('transition');
                    setPlayerName(preset);
                    handleSyncSubmit(preset);
                  }}
                  onMouseEnter={() => playSynthSound('hover')}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-[var(--game-accent)]/50 text-slate-300 hover:text-white transition-all cursor-pointer select-none"
                >
                  ⚡ {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* File Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-4 animate-fade-in">
          {/* Drag and Drop Zone */}
          <div
            {...getRootProps()}
            className={`
              border-2 
              border-dashed 
              rounded-2xl 
              p-10 
              text-center 
              cursor-pointer 
              transition-all 
              duration-300
              ${isDragActive 
                ? 'border-[var(--game-accent)] bg-[var(--game-accent)]/5 shadow-[0_0_15px_var(--game-glow)]' 
                : 'border-white/10 hover:border-slate-500 bg-black/10'}
              ${isLoading ? 'opacity-40 pointer-events-none' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <UploadCloud className={`w-12 h-12 ${isDragActive ? 'text-[var(--game-accent)] animate-pulse' : 'text-slate-500'}`} />
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {isDragActive ? 'Drop your match files here' : 'Drag & drop match history logs'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Supports JSON or CSV telemetry data exports</p>
              </div>
            </div>
          </div>

          {/* Selection Details */}
          {fileDetails && (
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 animate-float-in">
              <div className="flex items-center gap-3">
                <FileJson className="w-8 h-8 text-[var(--game-accent)]" />
                <div>
                  <p className="text-sm font-medium text-slate-200 truncate max-w-xs">{fileDetails.name}</p>
                  <p className="text-xs text-slate-500">{fileDetails.size}</p>
                </div>
              </div>
              <NeonButton 
                size="sm" 
                onClick={handleUploadSubmit}
                isLoading={isLoading}
              >
                PARSE FILE
              </NeonButton>
            </div>
          )}
        </div>
      )}

      {/* Progress & Feedback */}
      {isLoading && uploadProgress > 0 && (
        <div className="space-y-2 animate-float-in">
          <ProgressBar 
            value={uploadProgress} 
            max={100} 
            label={activeTab === 'sync' ? syncStatus : "Validating match schema & parsing nodes..."}
          />
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl animate-float-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs font-semibold">
            {activeTab === 'sync' 
              ? 'Telemetry profile sync successful! Real-time coaching models updated.' 
              : 'Match logs telemetry synchronized. Profiles recalculating...'}
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl animate-float-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      )}
    </GlassCard>
  );
}
