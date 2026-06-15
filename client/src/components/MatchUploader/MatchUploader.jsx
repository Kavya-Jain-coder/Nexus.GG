import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileJson, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Gamepad2, Download } from 'lucide-react';
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

const MAP_OPTIONS = {
  valorant: ['Ascent', 'Bind', 'Haven', 'Split', 'Icebox', 'Breeze', 'Fracture', 'Sunset', 'Lotus'],
  cs2: ['de_dust2', 'de_mirage', 'de_inferno', 'de_nuke', 'de_anubis', 'de_overpass', 'de_vertigo', 'de_ancient']
};

const AGENT_OPTIONS = {
  valorant: ['Jett', 'Reyna', 'Omen', 'Sova', 'Killjoy', 'Sage', 'Phoenix', 'Breach', 'Brimstone', 'Chamber', 'Cypher', 'Deadlock', 'Fade', 'Gekko', 'Harbor', 'Iso', 'Kay/O', 'Neon', 'Raze', 'Viper', 'Yoru']
};

const LANE_OPTIONS = ['Top', 'Jungle', 'Mid', 'Bottom', 'Support'];

const GAME_DEFAULTS = {
  valorant: {
    kills: '18',
    deaths: '14',
    assists: '6',
    map: 'Ascent',
    agent: 'Jett',
    rounds_won: '13',
    rounds_lost: '11',
    headshot_percent: '18',
    first_bloods: '3',
    first_deaths: '2',
    combat_score: '220'
  },
  cs2: {
    kills: '22',
    deaths: '17',
    assists: '4',
    map: 'de_dust2',
    rounds_won: '13',
    rounds_lost: '10',
    adr: '85',
    utility_thrown: '8',
    flash_duration_blinded: '5.2',
    first_kills: '3',
    accuracy: '45'
  },
  lol: {
    kills: '6',
    deaths: '3',
    assists: '12',
    champion: 'Ahri',
    lane: 'Mid',
    cs: '185',
    duration_minutes: '30',
    vision_score: '18',
    teamfight_participation: '55',
    gold_earned: '11500',
    is_win: true
  },
  fortnite: {
    kills: '5',
    deaths: '1',
    assists: '2',
    placement: '12',
    materials_built: '140',
    damage_dealt: '950',
    accuracy: '28',
    materials_gathered: '450',
    damage_taken: '280'
  },
  pubg: {
    kills: '3',
    deaths: '1',
    assists: '1',
    placement: '8',
    survival_seconds: '840',
    distance_traveled: '2800',
    damage_dealt: '380',
    heals_used: '2',
    boosts_used: '3'
  }
};

export default function MatchUploader() {
  const { uploadMatchFile, syncProfileMatches, isLoading } = useMatches();
  const { activeGame } = useGameStore();
  const [activeTab, setActiveTab] = useState('sync'); // 'sync' | 'upload' | 'manual'
  const [playerName, setPlayerName] = useState('');
  
  const [fileDetails, setFileDetails] = useState(null);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Manual Input form state
  const [manualStats, setManualStats] = useState({
    kills: '',
    deaths: '',
    assists: '',
    map: '',
    
    // Valorant
    agent: '',
    rounds_won: '',
    rounds_lost: '',
    headshot_percent: '',
    first_bloods: '',
    first_deaths: '',
    combat_score: '',

    // CS2
    adr: '',
    utility_thrown: '',
    flash_duration_blinded: '',
    first_kills: '',
    accuracy: '',

    // LoL
    champion: '',
    lane: 'Mid',
    cs: '',
    duration_minutes: '',
    vision_score: '',
    teamfight_participation: '',
    gold_earned: '',
    is_win: true,

    // Fortnite & PUBG
    placement: '',
    materials_built: '',
    damage_dealt: '',
    materials_gathered: '',
    damage_taken: '',
    survival_seconds: '',
    distance_traveled: '',
    heals_used: '',
    boosts_used: ''
  });

  const gameConfig = GAME_SYNC_LABELS[activeGame] || GAME_SYNC_LABELS.valorant;

  // Initialize form with defaults on active game change
  useEffect(() => {
    if (GAME_DEFAULTS[activeGame]) {
      setManualStats(prev => ({
        ...prev,
        ...GAME_DEFAULTS[activeGame]
      }));
    }
  }, [activeGame]);

  const handleInputChange = (field, val) => {
    setManualStats(prev => ({
      ...prev,
      [field]: val
    }));
  };

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

  // Handle Manual Upload Submission (JSON file)
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

  // Handle Interactive Form Submission
  const handleManualSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setUploadSuccess(false);

    // Validation
    const requiredInts = ['kills', 'deaths', 'assists'];
    for (const f of requiredInts) {
      if (manualStats[f] === '' || isNaN(parseInt(manualStats[f]))) {
        setError(`Please enter a valid number for ${f.toUpperCase()}`);
        return;
      }
    }

    let payload = {
      game: activeGame,
      match_id: `${activeGame.slice(0, 3)}_manual_${Date.now()}`,
      played_at: new Date().toISOString()
    };

    try {
      if (activeGame === 'valorant') {
        if (!manualStats.map) throw new Error('Please select a map');
        if (!manualStats.agent) throw new Error('Please select an agent');
        payload = {
          ...payload,
          agent: manualStats.agent,
          map: manualStats.map,
          rounds_won: parseInt(manualStats.rounds_won || 0),
          rounds_lost: parseInt(manualStats.rounds_lost || 0),
          kills: parseInt(manualStats.kills),
          deaths: parseInt(manualStats.deaths),
          assists: parseInt(manualStats.assists),
          headshot_percent: parseFloat(manualStats.headshot_percent || 0) / 100,
          first_bloods: parseInt(manualStats.first_bloods || 0),
          first_deaths: parseInt(manualStats.first_deaths || 0),
          combat_score: parseInt(manualStats.combat_score || 0)
        };
      } else if (activeGame === 'cs2') {
        if (!manualStats.map) throw new Error('Please select a map');
        payload = {
          ...payload,
          map: manualStats.map,
          rounds_won: parseInt(manualStats.rounds_won || 0),
          rounds_lost: parseInt(manualStats.rounds_lost || 0),
          kills: parseInt(manualStats.kills),
          deaths: parseInt(manualStats.deaths),
          assists: parseInt(manualStats.assists),
          adr: parseFloat(manualStats.adr || 0),
          utility_thrown: parseInt(manualStats.utility_thrown || 0),
          flash_duration_blinded: parseFloat(manualStats.flash_duration_blinded || 0),
          first_kills: parseInt(manualStats.first_kills || 0),
          accuracy: parseFloat(manualStats.accuracy || 0) / 100
        };
      } else if (activeGame === 'lol') {
        if (!manualStats.champion.trim()) throw new Error('Please enter champion name');
        payload = {
          ...payload,
          champion: manualStats.champion,
          lane: manualStats.lane,
          kills: parseInt(manualStats.kills),
          deaths: parseInt(manualStats.deaths),
          assists: parseInt(manualStats.assists),
          cs: parseInt(manualStats.cs || 0),
          duration_minutes: parseInt(manualStats.duration_minutes || 30),
          vision_score: parseInt(manualStats.vision_score || 0),
          teamfight_participation: parseFloat(manualStats.teamfight_participation || 0) / 100,
          gold_earned: parseInt(manualStats.gold_earned || 0),
          is_win: !!manualStats.is_win
        };
      } else if (activeGame === 'fortnite') {
        const placement = parseInt(manualStats.placement);
        if (isNaN(placement) || placement < 1 || placement > 100) {
          throw new Error('Placement must be a number between 1 and 100');
        }
        payload = {
          ...payload,
          placement,
          kills: parseInt(manualStats.kills),
          deaths: parseInt(manualStats.deaths || 1),
          assists: parseInt(manualStats.assists || 0),
          damage_dealt: parseInt(manualStats.damage_dealt || 0),
          materials_built: parseInt(manualStats.materials_built || 0),
          accuracy: parseFloat(manualStats.accuracy || 0) / 100,
          materials_gathered: parseInt(manualStats.materials_gathered || 0),
          damage_taken: parseInt(manualStats.damage_taken || 0)
        };
      } else if (activeGame === 'pubg') {
        const placement = parseInt(manualStats.placement);
        if (isNaN(placement) || placement < 1 || placement > 100) {
          throw new Error('Placement must be a number between 1 and 100');
        }
        payload = {
          ...payload,
          placement,
          kills: parseInt(manualStats.kills),
          deaths: parseInt(manualStats.deaths || 1),
          assists: parseInt(manualStats.assists || 0),
          survival_seconds: parseInt(manualStats.survival_seconds || 0),
          distance_traveled: parseInt(manualStats.distance_traveled || 0),
          damage_dealt: parseInt(manualStats.damage_dealt || 0),
          heals_used: parseInt(manualStats.heals_used || 0),
          boosts_used: parseInt(manualStats.boosts_used || 0)
        };
      }
    } catch (err) {
      setError(err.message);
      return;
    }

    setUploadProgress(10);
    let progress = 10;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 95) {
        clearInterval(interval);
      } else {
        setUploadProgress(progress);
      }
    }, 100);

    try {
      const jsonString = JSON.stringify(payload, null, 2);
      const file = new File([jsonString], `${payload.match_id}.json`, { type: 'application/json' });
      await uploadMatchFile(file);
      clearInterval(interval);
      setUploadProgress(100);
      setUploadSuccess(true);
      if (GAME_DEFAULTS[activeGame]) {
        setManualStats(prev => ({
          ...prev,
          ...GAME_DEFAULTS[activeGame]
        }));
      }
    } catch (err) {
      clearInterval(interval);
      setUploadProgress(0);
      setError(err.message || 'Verification failed. File structure is corrupted.');
    }
  };

  // Download game specific JSON template
  const downloadSampleTemplate = () => {
    playSynthSound('click');
    const samples = {
      valorant: {
        game: 'valorant',
        agent: 'Reyna',
        map: 'Ascent',
        rounds_won: 13,
        rounds_lost: 9,
        kills: 22,
        deaths: 15,
        assists: 4,
        headshot_percent: 0.22,
        first_bloods: 3,
        first_deaths: 1,
        combat_score: 245
      },
      cs2: {
        game: 'cs2',
        map: 'de_dust2',
        rounds_won: 13,
        rounds_lost: 11,
        kills: 20,
        deaths: 18,
        assists: 6,
        adr: 82.5,
        utility_thrown: 12,
        flash_duration_blinded: 8.4,
        first_kills: 4,
        accuracy: 0.45
      },
      lol: {
        game: 'lol',
        champion: 'Ahri',
        lane: 'Mid',
        kills: 8,
        deaths: 2,
        assists: 12,
        cs: 210,
        duration_minutes: 32,
        vision_score: 25,
        teamfight_participation: 0.65,
        gold_earned: 12500,
        is_win: true
      },
      fortnite: {
        game: 'fortnite',
        placement: 5,
        kills: 6,
        deaths: 1,
        assists: 2,
        damage_dealt: 1200,
        materials_built: 150,
        accuracy: 0.32,
        materials_gathered: 600,
        damage_taken: 350
      },
      pubg: {
        game: 'pubg',
        placement: 12,
        kills: 4,
        deaths: 1,
        assists: 1,
        survival_seconds: 980,
        distance_traveled: 3200,
        damage_dealt: 450,
        heals_used: 3,
        boosts_used: 2
      }
    };
    const data = samples[activeGame] || samples.valorant;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nexus_template_${activeGame}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <GlassCard className="w-full flex flex-col gap-6">
      <div className="border-b border-white/5 pb-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-white">Match History Telemetry</h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyze your performance, track player metrics, and fuel your coaching recommendation engine.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap bg-black/40 p-1 rounded-xl border border-white/5 select-none w-fit gap-1">
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
          <button
            onClick={() => {
              playSynthSound('click');
              setActiveTab('manual');
              setError(null);
              setUploadSuccess(false);
            }}
            onMouseEnter={() => playSynthSound('hover')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 ${
              activeTab === 'manual'
                ? 'bg-[var(--game-accent)] text-black shadow-[0_0_10px_var(--game-glow)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            MANUAL INPUT
          </button>
        </div>
      </div>

      {/* Sync Profile Tab */}
      {activeTab === 'sync' && (
        <div className="space-y-4 animate-fade-in text-left">
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
        <div className="space-y-4 animate-fade-in text-left">
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

          {/* Download Helper / Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5 gap-3">
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-300">Don't have a JSON telemetry file?</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Download a pre-formatted sample JSON schema for {activeGame.toUpperCase()} or use the Manual Input tab.
              </p>
            </div>
            <button
              onClick={downloadSampleTemplate}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--game-accent)]/50 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template
            </button>
          </div>

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

      {/* Manual Input Tab */}
      {activeTab === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-4 animate-fade-in text-left">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kills</label>
              <input
                type="number"
                min="0"
                value={manualStats.kills}
                onChange={(e) => handleInputChange('kills', e.target.value)}
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deaths</label>
              <input
                type="number"
                min="0"
                value={manualStats.deaths}
                onChange={(e) => handleInputChange('deaths', e.target.value)}
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
              />
            </div>
            <div className="space-y-1 col-span-2 md:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assists</label>
              <input
                type="number"
                min="0"
                value={manualStats.assists}
                onChange={(e) => handleInputChange('assists', e.target.value)}
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
              />
            </div>

            {activeGame === 'valorant' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Agent</label>
                  <select
                    value={manualStats.agent}
                    onChange={(e) => handleInputChange('agent', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  >
                    {AGENT_OPTIONS.valorant.map(a => <option key={a} value={a} className="bg-slate-900">{a}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Map</label>
                  <select
                    value={manualStats.map}
                    onChange={(e) => handleInputChange('map', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  >
                    {MAP_OPTIONS.valorant.map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Combat Score</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.combat_score}
                    onChange={(e) => handleInputChange('combat_score', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rounds Won</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.rounds_won}
                    onChange={(e) => handleInputChange('rounds_won', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rounds Lost</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.rounds_lost}
                    onChange={(e) => handleInputChange('rounds_lost', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Headshot %</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualStats.headshot_percent}
                      onChange={(e) => handleInputChange('headshot_percent', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500">%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">First Bloods</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.first_bloods}
                    onChange={(e) => handleInputChange('first_bloods', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">First Deaths</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.first_deaths}
                    onChange={(e) => handleInputChange('first_deaths', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
              </>
            )}

            {activeGame === 'cs2' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Map</label>
                  <select
                    value={manualStats.map}
                    onChange={(e) => handleInputChange('map', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  >
                    {MAP_OPTIONS.cs2.map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rounds Won</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.rounds_won}
                    onChange={(e) => handleInputChange('rounds_won', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rounds Lost</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.rounds_lost}
                    onChange={(e) => handleInputChange('rounds_lost', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ADR</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={manualStats.adr}
                    onChange={(e) => handleInputChange('adr', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Utility Thrown</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.utility_thrown}
                    onChange={(e) => handleInputChange('utility_thrown', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Flash Blind Duration</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={manualStats.flash_duration_blinded}
                      onChange={(e) => handleInputChange('flash_duration_blinded', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-3 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">sec</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">First Kills</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.first_kills}
                    onChange={(e) => handleInputChange('first_kills', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Accuracy</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualStats.accuracy}
                      onChange={(e) => handleInputChange('accuracy', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500">%</span>
                  </div>
                </div>
              </>
            )}

            {activeGame === 'lol' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Champion</label>
                  <input
                    type="text"
                    value={manualStats.champion}
                    onChange={(e) => handleInputChange('champion', e.target.value)}
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lane</label>
                  <select
                    value={manualStats.lane}
                    onChange={(e) => handleInputChange('lane', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  >
                    {LANE_OPTIONS.map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CS (Minions)</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.cs}
                    onChange={(e) => handleInputChange('cs', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Match Duration</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={manualStats.duration_minutes}
                      onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-3 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">min</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vision Score</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.vision_score}
                    onChange={(e) => handleInputChange('vision_score', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teamfight Part. %</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualStats.teamfight_participation}
                      onChange={(e) => handleInputChange('teamfight_participation', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500">%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gold Earned</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.gold_earned}
                    onChange={(e) => handleInputChange('gold_earned', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Match Result</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleInputChange('is_win', true)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        manualStats.is_win
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                          : 'bg-black/30 border-white/10 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      WIN
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('is_win', false)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        !manualStats.is_win
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                          : 'bg-black/30 border-white/10 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      LOSS
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeGame === 'fortnite' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Placement</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={manualStats.placement}
                    onChange={(e) => handleInputChange('placement', e.target.value)}
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Materials Built</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.materials_built}
                    onChange={(e) => handleInputChange('materials_built', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Damage Dealt</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.damage_dealt}
                    onChange={(e) => handleInputChange('damage_dealt', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Accuracy</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualStats.accuracy}
                      onChange={(e) => handleInputChange('accuracy', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500">%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Materials Gathered</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.materials_gathered}
                    onChange={(e) => handleInputChange('materials_gathered', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Damage Taken</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.damage_taken}
                    onChange={(e) => handleInputChange('damage_taken', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
              </>
            )}

            {activeGame === 'pubg' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Placement</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={manualStats.placement}
                    onChange={(e) => handleInputChange('placement', e.target.value)}
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Survival Time</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={manualStats.survival_seconds}
                      onChange={(e) => handleInputChange('survival_seconds', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-3 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">sec</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Distance Traveled</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={manualStats.distance_traveled}
                      onChange={(e) => handleInputChange('distance_traveled', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-3 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">m</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Damage Dealt</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.damage_dealt}
                    onChange={(e) => handleInputChange('damage_dealt', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Heals Used</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.heals_used}
                    onChange={(e) => handleInputChange('heals_used', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Boosts Used</label>
                  <input
                    type="number"
                    min="0"
                    value={manualStats.boosts_used}
                    onChange={(e) => handleInputChange('boosts_used', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[var(--game-accent)] focus:ring-1 focus:ring-[var(--game-accent)] transition-all"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <NeonButton type="submit" size="md" isLoading={isLoading}>
              SYNCHRONIZE STATS
            </NeonButton>
          </div>
        </form>
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
