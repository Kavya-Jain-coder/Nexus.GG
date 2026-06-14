import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, Mail, User, Volume2, VolumeX, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { useGameStore } from '../../store/useGameStore';
import ParticleBackground from '../../components/layout/ParticleBackground';
import GameIcon from '../../components/ui/GameIcon';

// Centralized background image imports for production bundle safety
import heroTunnel from '../../assets/backgrounds/hero-tunnel.jpg';
import dashboardBg from '../../assets/backgrounds/dashboard-bg.jpg';
import valorantBg from '../../assets/backgrounds/valorant-bg.jpg';
import cs2Bg from '../../assets/backgrounds/cs2-bg.jpg';
import lolBg from '../../assets/backgrounds/lol-bg.jpg';
import pubgBg from '../../assets/backgrounds/pubg-bg.jpg';
import logoPng from '../../assets/backgrounds/Removed-bg-NexusGG-Logo.png';

// Web Audio API sci-fi synthesizer sound engine (no external audio files required!)
const playSynthSound = (type, isMuted) => {
  if (isMuted) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'portal-logo') {
      // High-tech portal golden sweep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 1.2);
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.start(now);
      osc.stop(now + 1.2);
    } else if (type === 'click') {
      // Sci-fi interface tick
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);
      gainNode.gain.setValueAtTime(0.18, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'hover') {
      // Ultra short UI click hover
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      gainNode.gain.setValueAtTime(0.02, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'error') {
      // Two-note hazard alarm
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(130, now + 0.12);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'success') {
      // Ascending double-beeps
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(800, now + 0.07);
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'transition') {
      // Deep speed-swipe swoosh
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.7);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.start(now);
      osc.stop(now + 0.7);
    } else if (type === 'keyboard') {
      // Cyber typing click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000 + Math.random() * 500, now);
      gainNode.gain.setValueAtTime(0.02, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'lines') {
      // Vector line draw beam
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.linearRampToValueAtTime(350, now + 0.8);
      gainNode.gain.setValueAtTime(0.06, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  } catch (e) {
    // browser blocked audio Context
  }
};

// Monospace typewriter component with keystroke sound effects
function Typewriter({ text, delay = 35, onComplete, isMuted }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        playSynthSound('keyboard', isMuted);
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay, isMuted]);
  
  return <span>{displayedText}</span>;
}

// Gold lines vector draw background animation
function GoldDrawingLines({ isMuted }) {
  useEffect(() => {
    playSynthSound('lines', isMuted);
  }, [isMuted]);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
      <motion.path
        d="M -100 150 L 500 150 L 600 400"
        stroke="#c8aa6e"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />
      <motion.path
        d="M 1300 650 L 800 650 L 650 450"
        stroke="#c8aa6e"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, ease: "easeInOut", delay: 0.25 }}
      />
      <motion.polygon
        points="550,220 620,310 480,310"
        stroke="#c8aa6e"
        strokeWidth="1"
        fill="none"
        opacity="0.15"
        initial={{ pathLength: 0, rotate: -15 }}
        animate={{ pathLength: 1, rotate: 345 }}
        transition={{ duration: 2.2, ease: "easeInOut", delay: 0.4 }}
      />
    </svg>
  );
}

// Hexagon wave backdrop pattern generator
function HexagonGrid({ activeWave = false }) {
  const hexes = Array.from({ length: 48 });
  const cols = 8;
  const rows = 6;

  return (
    <div className="absolute inset-0 grid grid-cols-8 md:grid-cols-12 gap-3 p-6 opacity-15 pointer-events-none overflow-hidden z-0">
      {hexes.map((_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        // Wave starts at bottom-right, calculating distance
        const distance = (cols - 1 - col) + (rows - 1 - row);
        
        return (
          <motion.svg
            key={i}
            viewBox="0 0 100 100"
            className="w-full aspect-square text-cyan-400 fill-none stroke-current stroke-1"
            initial={{ opacity: 0, scale: 0.75 }}
            animate={
              activeWave
                ? {
                    opacity: [0.05, 0.7, 0.05],
                    scale: [0.8, 1.05, 0.85],
                    transition: {
                      delay: distance * 0.08,
                      duration: 1.4,
                      repeat: Infinity,
                      repeatDelay: 2.5
                    }
                  }
                : {
                    opacity: 0.15,
                    scale: 1,
                    transition: { delay: (i % 6) * 0.04 }
                  }
            }
          >
            <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" />
          </motion.svg>
        );
      })}
    </div>
  );
}

// Staggered particle burst emitter for logo intro
function GoldenParticleBurst({ onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 500;
    canvas.height = 500;

    const particles = [];
    const colors = ['#d4af37', '#ffd700', '#ffec8b', '#cfb53b', '#e6c229'];

    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5.5 + 2.5;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2.8 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.018 + 0.012
      });
    }

    let animationId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.vy += 0.04; // gravity pull

        if (p.alpha > 0) {
          active = true;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fill();
        }
      });

      if (active) {
        animationId = requestAnimationFrame(render);
      } else if (onComplete) {
        onComplete();
      }
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none z-10"
    />
  );
}

// 5 Game Battlefield Cards
const BATTLEFIELDS = [
  { id: 'valorant', name: 'VALORANT', accent: '#ff4655', glow: 'rgba(255, 70, 85, 0.4)', icon: '🔫', corner: [-300, -300] },
  { id: 'cs2', name: 'CS2', accent: '#de9b35', glow: 'rgba(222, 155, 53, 0.4)', icon: '💣', corner: [300, -300] },
  { id: 'lol', name: 'LEAGUE OF LEGENDS', accent: '#c8aa6e', glow: 'rgba(200, 170, 110, 0.4)', icon: '⚔️', corner: [-300, 300] },
  { id: 'fortnite', name: 'FORTNITE', accent: '#00f0ff', glow: 'rgba(0, 240, 255, 0.4)', icon: '🛡️', corner: [300, 300] },
  { id: 'pubg', name: 'PUBG', accent: '#f25c05', glow: 'rgba(242, 92, 5, 0.4)', icon: '🪂', corner: [0, 300] }
];

export default function Auth() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();
  
  // Audio state
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('nexus_auth_muted');
    return saved ? JSON.parse(saved) : false;
  });

  // Step tracking: portal -> gate -> signup-* / login-*
  const [step, setStep] = useState('portal');
  const [history, setHistory] = useState(['portal']);
  const [direction, setDirection] = useState(1);

  // Form Fields State
  const [callsign, setCallsign] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI state feedback
  const [gateTerminalDone, setGateTerminalDone] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [burstActive, setBurstActive] = useState(false);
  const [shakingInput, setShakingInput] = useState(false);
  const [pulseSuccess, setPulseSuccess] = useState(false);
  const [inputError, setInputError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [initializingProgress, setInitializingProgress] = useState(0);

  useEffect(() => {
    // Sync muted state
    localStorage.setItem('nexus_auth_muted', JSON.stringify(isMuted));
  }, [isMuted]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (step === 'gate') {
      setGateTerminalDone(false);
    }
  }, [step]);

  // Step 1 Intro timer
  useEffect(() => {
    if (step === 'portal') {
      // 0.8s: fade logo & trigger golden particle burst
      const burstTimer = setTimeout(() => {
        setBurstActive(true);
        playSynthSound('portal-logo', isMuted);
      }, 800);

      // 1.0s: start tagline typewriter fade
      const taglineTimer = setTimeout(() => {
        setShowTagline(true);
      }, 1000);

      // 2.8s: auto transition with light-speed blur swipe
      const transitionTimer = setTimeout(() => {
        playSynthSound('transition', isMuted);
        navigateStep('gate');
      }, 2900);

      return () => {
        clearTimeout(burstTimer);
        clearTimeout(taglineTimer);
        clearTimeout(transitionTimer);
      };
    }
  }, [step]);

  // Custom step navigator supporting back history direction
  const navigateStep = (nextStep) => {
    setInputError('');
    setShowPassword(false);
    setDirection(1);
    setHistory((prev) => [...prev, nextStep]);
    setStep(nextStep);
  };

  const handleBack = () => {
    if (history.length <= 1) return;
    playSynthSound('click', isMuted);
    setInputError('');
    setShowPassword(false);
    setDirection(-1);
    const updatedHistory = [...history];
    updatedHistory.pop(); // Remove current
    const prevStep = updatedHistory[updatedHistory.length - 1];
    setHistory(updatedHistory);
    setStep(prevStep);
  };

  // Sound triggering handlers
  const handleHover = () => playSynthSound('hover', isMuted);
  const handleClick = () => playSynthSound('click', isMuted);

  // Verification & Submission Handlers
  const handleCallsgnNext = (e) => {
    e.preventDefault();
    if (!callsign || callsign.trim().length < 3) {
      triggerError('Callsign must be at least 3 characters.');
      return;
    }
    triggerSuccess(() => navigateStep('signup-email'));
  };

  const handleEmailNext = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      triggerError('Please drop a valid tactical email coordinates.');
      return;
    }
    triggerSuccess(() => {
      if (history.includes('gate') && step === 'login-identify') {
        navigateStep('login-cipher');
      } else {
        navigateStep('signup-password');
      }
    });
  };

  const handlePasswordNext = (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      triggerError('Encryption key must be at least 6 characters.');
      return;
    }
    triggerSuccess(async () => {
      if (step === 'login-cipher') {
        // Execute Login
        await executeLogin();
      } else {
        navigateStep('signup-battlefield');
      }
    });
  };

  const handleBattlefieldSelect = (gameId) => {
    setSelectedGame(gameId);
    playSynthSound('click', isMuted);
    triggerSuccess(async () => {
      // Execute Signup & Initialization
      await executeSignup(gameId);
    });
  };

  // Error feedback (shakes the card, flashes text, plays alarm)
  const triggerError = (msg) => {
    setInputError(msg);
    setShakingInput(true);
    playSynthSound('error', isMuted);
    setTimeout(() => setShakingInput(false), 500);
  };

  // Success feedback (glowing animation, plays beep, then executes action)
  const triggerSuccess = (callback) => {
    setPulseSuccess(true);
    playSynthSound('success', isMuted);
    setTimeout(() => {
      setPulseSuccess(false);
      callback();
    }, 550);
  };

  // Supabase Signup Execution
  const executeSignup = async (primaryGame) => {
    setSubmitting(true);
    setInitializingProgress(15);
    navigateStep('signup-initializing');
    
    try {
      // Step A: Trigger Supabase Auth signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: callsign.toLowerCase().trim(),
            display_name: callsign,
            avatar_url: ''
          }
        }
      });
      if (error) throw error;
      
      setInitializingProgress(55);
      
      // Step B: If session exists (autologin), write game_profiles
      if (data?.session?.user) {
        const { error: profileError } = await supabase
          .from('game_profiles')
          .insert({
            user_id: data.session.user.id,
            game_type: primaryGame,
            current_rank: 'Bronze I',
            peak_rank: 'Bronze I',
            total_xp: 0
          });
        
        if (profileError) console.error('Profile creation warning:', profileError);
      }
      
      // Animate progress bar to 100
      let progress = 55;
      const interval = setInterval(() => {
        progress += 10;
        setInitializingProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            playSynthSound('transition', isMuted);
            navigate('/dashboard');
          }, 600);
        }
      }, 150);
      
    } catch (err) {
      // Rollback step on error
      setTimeout(() => {
        handleBack(); // Go back to battlefield selection
        triggerError(err.message || 'Verification database routing error.');
      }, 1000);
    } finally {
      setSubmitting(false);
    }
  };

  // Supabase Login Execution
  const executeLogin = async () => {
    setSubmitting(true);
    setInitializingProgress(20);
    navigateStep('login-welcome');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;

      setInitializingProgress(60);

      // Successfully authenticated
      let progress = 60;
      const interval = setInterval(() => {
        progress += 15;
        setInitializingProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            playSynthSound('transition', isMuted);
            navigate('/dashboard');
          }, 600);
        }
      }, 120);

    } catch (err) {
      // Rollback step on error
      setTimeout(() => {
        handleBack(); // Go back to cipher code step
        triggerError(err.message || 'Identity authorization denied.');
      }, 1000);
    } finally {
      setSubmitting(false);
    }
  };

  // Framer Motion Page transition variants (Horizontal Swipe Blur)
  const pageVariants = {
    enter: (dir) => ({
      x: dir > 0 ? '100vw' : '-100vw',
      filter: 'blur(25px)',
      opacity: 0
    }),
    center: {
      x: 0,
      filter: 'blur(0px)',
      opacity: 1
    },
    exit: (dir) => ({
      x: dir < 0 ? '100vw' : '-100vw',
      filter: 'blur(25px)',
      opacity: 0
    })
  };

  // Dots progress renderer
  const getDotsCount = () => {
    if (step.startsWith('signup')) return 4;
    if (step.startsWith('login')) return 2;
    return 0;
  };

  const getActiveDotIndex = () => {
    if (step === 'signup-callsign') return 0;
    if (step === 'signup-email') return 1;
    if (step === 'signup-password') return 2;
    if (step === 'signup-battlefield') return 3;
    if (step === 'login-identify') return 0;
    if (step === 'login-cipher') return 1;
    return 0;
  };

  // Get active background image
  const getStepBackground = () => {
    switch (step) {
      case 'portal':
        return heroTunnel;
      case 'gate':
        return dashboardBg;
      case 'signup-callsign':
        return valorantBg;
      case 'signup-email':
      case 'login-cipher':
        return cs2Bg;
      case 'signup-password':
      case 'login-identify':
        return lolBg;
      case 'signup-battlefield':
        return pubgBg;
      case 'signup-initializing':
      case 'login-welcome':
        return heroTunnel;
      default:
        return dashboardBg;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-display text-white">
      {/* Background Vignette Overlays to prevent raw image overpowering text */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-10" 
           style={{
             background: 'radial-gradient(circle at center, transparent 20%, rgba(3,3,7,0.85) 90%)'
           }}
      />
      <div className="absolute inset-0 bg-black/45 pointer-events-none z-10" />

      {/* Background Transition Wrapper */}
      <motion.div
        key={getStepBackground()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
        style={{
          backgroundImage: `url(${getStepBackground()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
        }}
        className="absolute inset-0 w-full h-full z-0"
      />

      {/* Floating System Toolbar: Audio controls & Back navigation */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
        {/* Back Button */}
        {step !== 'portal' && step !== 'gate' && !step.includes('initializing') && !step.includes('welcome') ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/45 border border-white/10 hover:border-cyan-400 hover:text-cyan-400 transition-all font-mono text-xs uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK</span>
          </button>
        ) : (
          <div />
        )}

        {/* Audio Muted Indicator */}
        <button
          onClick={() => {
            setIsMuted(!isMuted);
            playSynthSound('click', !isMuted);
          }}
          className="p-2 rounded-lg bg-black/45 border border-white/10 hover:border-yellow-400 hover:text-yellow-400 transition-all"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-yellow-400" />}
        </button>
      </div>

      {/* Top Center Step Dot Progress Indicators */}
      {getDotsCount() > 0 && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-40">
          {Array.from({ length: getDotsCount() }).map((_, i) => {
            const isActive = i === getActiveDotIndex();
            const isCompleted = i < getActiveDotIndex();
            
            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{
                  scale: isActive ? 1.25 : 1,
                  backgroundColor: isActive
                    ? (step.startsWith('signup') ? '#ff4655' : '#de9b35') // pink/gold
                    : isCompleted
                    ? '#00f0ff' // cyan complete
                    : 'rgba(255,255,255,0.2)'
                }}
                className="w-2.5 h-2.5 rounded-full border border-black/50 shadow-[0_0_10px_currentColor]"
                style={{
                  color: isActive ? (step.startsWith('signup') ? '#ff4655' : '#de9b35') : isCompleted ? '#00f0ff' : 'transparent'
                }}
              />
            );
          })}
        </div>
      )}

      {/* Main Transitions Area */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={step}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 120, damping: 22 },
            opacity: { duration: 0.4 },
            filter: { duration: 0.5 }
          }}
          className="relative w-full h-full flex items-center justify-center p-6 z-20"
        >
          {/* STEP 1: THE PORTAL */}
          {step === 'portal' && (
            <div className="flex flex-col items-center justify-center text-center max-w-xl select-none relative">
              {burstActive && <GoldenParticleBurst />}
              
              <motion.img
                src={logoPng}
                alt="NEXUS.GG Logo"
                initial={{ opacity: 0, scale: 0.8, filter: 'drop-shadow(0 0 0px rgba(0,0,0,0))' }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.6))'
                }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="h-48 md:h-56 lg:h-64 object-contain mb-10 filter drop-shadow-[0_0_35px_rgba(212,175,55,0.45)] select-none"
              />

              {showTagline && (
                <div className="h-6">
                  <span className="font-mono text-xs md:text-sm font-black text-cyan-400 tracking-[0.3em] uppercase block drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                    <Typewriter text="YOUR COACHING OPERATING SYSTEM" delay={40} isMuted={isMuted} />
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: THE GATE */}
          {step === 'gate' && (
            <div className="w-full h-full relative flex flex-col justify-end p-8 md:p-16">
              <ParticleBackground />
              
              {/* Bottom Right Quadrant Terminal Query */}
              <div className="absolute right-[5%] md:right-[10%] bottom-[30%] text-right space-y-6 z-20">
                <div className="font-mono text-emerald-400 text-lg md:text-xl font-bold tracking-widest">
                  &gt; <Typewriter 
                    text="AGENT DETECTED..." 
                    delay={45} 
                    isMuted={isMuted} 
                    onComplete={() => {
                      setTimeout(() => setGateTerminalDone(true), 600);
                    }} 
                  />
                  {gateTerminalDone && (
                    <span className="block mt-2 text-cyan-400">
                      &gt; <Typewriter text="HAVE WE MET BEFORE?" delay={45} isMuted={isMuted} />
                    </span>
                  )}
                </div>

                {/* Staggered Glassmorphism Decision Cards */}
                {gateTerminalDone && (
                  <div className="flex flex-col sm:flex-row justify-end items-stretch gap-6 pt-6">
                    <motion.div
                      initial={{ opacity: 0, x: -50, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      onMouseEnter={handleHover}
                      onClick={() => {
                        handleClick();
                        navigateStep('signup-callsign');
                      }}
                      data-sound="gate-card"
                      className="group cursor-pointer p-6 rounded-2xl glass-panel text-left w-52 md:w-56 border border-white/5 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all duration-300"
                    >
                      <span className="text-2xl mb-2 block">🦾</span>
                      <h4 className="text-xs text-slate-400 font-mono tracking-widest uppercase mb-1">COORDINATE CODE: NEW</h4>
                      <h3 className="font-display font-black text-lg text-white group-hover:text-cyan-400 tracking-wide transition-colors">NEW RECRUIT</h3>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 50, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
                      onMouseEnter={handleHover}
                      onClick={() => {
                        handleClick();
                        navigateStep('login-identify');
                      }}
                      data-sound="gate-card"
                      className="group cursor-pointer p-6 rounded-2xl glass-panel text-left w-52 md:w-56 border border-white/5 hover:border-yellow-500 hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all duration-300"
                    >
                      <span className="text-2xl mb-2 block">🔑</span>
                      <h4 className="text-xs text-slate-400 font-mono tracking-widest uppercase mb-1">CIPHER ENTRY: RETURNING</h4>
                      <h3 className="font-display font-black text-lg text-white group-hover:text-yellow-500 tracking-wide transition-colors">RETURNING AGENT</h3>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3A - Q1: CALLSIGN (Valorant Doors Background) */}
          {step === 'signup-callsign' && (
            <motion.div 
              animate={shakingInput ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
              className="absolute left-8 md:left-24 top-[35%] max-w-lg w-[85%] text-left z-20 space-y-6"
            >
              {/* slide-in neon trail indicator */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ duration: 0.6 }}
                className="h-1.5 bg-pink-500 rounded-full shadow-[0_0_10px_#ff4655]" 
              />
              <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-wide leading-tight">
                CHOOSE YOUR CALLSIGN
              </h2>
              <p className="text-xs text-slate-450 uppercase tracking-widest font-mono">
                Input your global operating handle (Username)
              </p>
              
              <form onSubmit={handleCallsgnNext} className="relative w-full pt-4">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="AGENT_COACH_99"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  className={`w-full bg-transparent border-b-2 border-white/10 text-white font-mono text-xl md:text-2xl pb-3 focus:outline-none transition-all duration-300 text-left
                    ${pulseSuccess ? 'border-emerald-500 shadow-[0_4px_15px_rgba(16,185,129,0.3)]' : 'focus:border-pink-500 focus:shadow-[0_4px_15px_rgba(255,70,85,0.25)]'}
                  `}
                />
                
                {inputError && (
                  <p className="text-xs text-pink-500 font-mono mt-3 flex items-center gap-1.5 animate-float-in">
                    <AlertCircle className="w-3.5 h-3.5" /> {inputError}
                  </p>
                )}

                <button
                  type="submit"
                  onMouseEnter={handleHover}
                  className="absolute right-0 bottom-3 p-1 text-slate-450 hover:text-pink-500 transition-colors"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3A - Q2: DROP EMAIL (CS2 Hexagons Background) */}
          {step === 'signup-email' && (
            <div className="w-full h-full relative flex items-center justify-center">
              <HexagonGrid />
              <motion.div 
                animate={shakingInput ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
                className="absolute bottom-28 left-1/2 -translate-x-1/2 max-w-lg w-[85%] text-center z-20 space-y-6"
              >
                <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-wide">
                  DROP YOUR EMAIL, AGENT
                </h2>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                  Enter your secure telemetry receiving address
                </p>

                <form onSubmit={handleEmailNext} className="relative w-full pt-4">
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="agent@nexus.gg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-transparent border-b-2 border-white/10 text-white font-mono text-lg md:text-xl pb-3 focus:outline-none transition-all duration-300 text-center
                      ${pulseSuccess ? 'border-emerald-500 shadow-[0_4px_15px_rgba(16,185,129,0.3)]' : 'focus:border-cyan-400 focus:shadow-[0_4px_15px_rgba(0,240,255,0.25)]'}
                    `}
                  />

                  {inputError && (
                    <p className="text-xs text-cyan-400 font-mono mt-3 flex items-center justify-center gap-1.5 animate-float-in">
                      <AlertCircle className="w-3.5 h-3.5 text-cyan-400" /> {inputError}
                    </p>
                  )}

                  <button
                    type="submit"
                    onMouseEnter={handleHover}
                    className="absolute right-2 bottom-3 p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </form>
              </motion.div>
            </div>
          )}

          {/* STEP 3A - Q3: PASSWORD (LoL Gold/Black Background) */}
          {step === 'signup-password' && (
            <div className="w-full h-full relative">
              <GoldDrawingLines isMuted={isMuted} />
              
              <motion.div 
                animate={shakingInput ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
                className="absolute left-8 md:left-24 top-[35%] max-w-lg w-[85%] text-left z-20 space-y-6"
              >
                <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-wide">
                  SET YOUR ENCRYPTION KEY
                </h2>
                <p className="text-xs text-slate-450 uppercase tracking-widest font-mono">
                  Establish a secure access password profile
                </p>

                <form onSubmit={handlePasswordNext} className="relative w-full pt-4">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-transparent border-b-2 border-white/10 text-white font-mono text-xl md:text-2xl pb-3 pr-20 focus:outline-none transition-all duration-300 text-left
                      ${pulseSuccess ? 'border-emerald-500 shadow-[0_4px_15px_rgba(16,185,129,0.3)]' : 'focus:border-yellow-500 focus:shadow-[0_4px_15px_rgba(212,175,55,0.25)]'}
                    `}
                  />

                  {inputError && (
                    <p className="text-xs text-yellow-500 font-mono mt-3 flex items-center gap-1.5 animate-float-in">
                      <AlertCircle className="w-3.5 h-3.5" /> {inputError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseEnter={handleHover}
                    className="absolute right-10 bottom-3 p-1 text-slate-455 hover:text-white transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>

                  <button
                    type="submit"
                    onMouseEnter={handleHover}
                    className="absolute right-0 bottom-3 p-1 text-slate-450 hover:text-yellow-500 transition-colors"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </form>
              </motion.div>
            </div>
          )}

          {/* STEP 3A - Q4: SELECT BATTLEFIELD (PUBG Red Background) */}
          {step === 'signup-battlefield' && (
            <div className="absolute top-[12%] left-1/2 -translate-x-1/2 max-w-5xl w-[90%] text-center z-20 space-y-6">
              <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">
                SELECT YOUR BATTLEFIELD
              </h2>
              <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
                Choose your primary tactical game training theater
              </p>

              {/* Fly-in Game Grid Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-10">
                {BATTLEFIELDS.map((game, i) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, x: game.corner[0], y: game.corner[1] }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ type: 'spring', stiffness: 90, damping: 18, delay: i * 0.1 }}
                    onMouseEnter={handleHover}
                    onClick={() => handleBattlefieldSelect(game.id)}
                    className="group cursor-pointer p-6 rounded-2xl glass-panel flex flex-col items-center justify-center border border-white/5 hover:border-[var(--hover-accent)] transition-all duration-300 select-none hover:-translate-y-1"
                    style={{
                      '--hover-accent': game.accent,
                      boxShadow: `0 4px 15px rgba(0,0,0,0.4)`
                    }}
                  >
                    {/* Floating icon */}
                    <div className="transform group-hover:scale-110 transition-transform duration-300 mb-1">
                      <GameIcon gameId={game.id} className="w-12 h-12" />
                    </div>
                    <h3 className="font-mono text-xs font-black text-slate-300 group-hover:text-white tracking-widest uppercase">
                      {game.name}
                    </h3>
                  </motion.div>
                ))}
              </div>

              {inputError && (
                <p className="text-xs text-rose-500 font-mono mt-8 flex items-center justify-center gap-1.5 animate-float-in">
                  <AlertCircle className="w-3.5 h-3.5" /> {inputError}
                </p>
              )}
            </div>
          )}

          {/* STEP 3B - LOGIN Q1: IDENTIFY USERNAME/EMAIL (LoL Geometric Background) */}
          {step === 'login-identify' && (
            <div className="w-full h-full relative">
              <GoldDrawingLines isMuted={isMuted} />
              
              <motion.div 
                animate={shakingInput ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
                className="absolute left-8 md:left-24 top-[35%] max-w-lg w-[85%] text-left z-20 space-y-6"
              >
                <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-wide leading-tight">
                  IDENTIFY YOURSELF
                </h2>
                <p className="text-xs text-slate-450 uppercase tracking-widest font-mono">
                  Input your tactical agent email address
                </p>

                <form onSubmit={handleEmailNext} className="relative w-full pt-4">
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="agent@nexus.gg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-transparent border-b-2 border-white/10 text-white font-mono text-xl md:text-2xl pb-3 focus:outline-none transition-all duration-300 text-left
                      ${pulseSuccess ? 'border-emerald-500 shadow-[0_4px_15px_rgba(16,185,129,0.3)]' : 'focus:border-yellow-500 focus:shadow-[0_4px_15px_rgba(212,175,55,0.25)]'}
                    `}
                  />

                  {inputError && (
                    <p className="text-xs text-yellow-500 font-mono mt-3 flex items-center gap-1.5 animate-float-in">
                      <AlertCircle className="w-3.5 h-3.5" /> {inputError}
                    </p>
                  )}

                  <button
                    type="submit"
                    onMouseEnter={handleHover}
                    className="absolute right-0 bottom-3 p-1 text-slate-450 hover:text-yellow-500 transition-colors"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </form>
              </motion.div>
            </div>
          )}

          {/* STEP 3B - LOGIN Q2: CONFIRM CIPHER (CS2 Hexagons Background) */}
          {step === 'login-cipher' && (
            <div className="w-full h-full relative">
              <HexagonGrid activeWave={true} />
              
              <motion.div 
                animate={shakingInput ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
                className="absolute left-8 md:left-24 top-[35%] max-w-lg w-[85%] text-left z-20 space-y-6"
              >
                <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-wide">
                  CONFIRM YOUR CIPHER
                </h2>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                  Input password authentication coordinates
                </p>

                <form onSubmit={handlePasswordNext} className="relative w-full pt-4">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-transparent border-b-2 border-white/10 text-white font-mono text-xl md:text-2xl pb-3 pr-20 focus:outline-none transition-all duration-300 text-left
                      ${pulseSuccess ? 'border-emerald-500 shadow-[0_4px_15px_rgba(16,185,129,0.3)]' : 'focus:border-cyan-400 focus:shadow-[0_4px_15px_rgba(0,240,255,0.25)]'}
                    `}
                  />

                  {inputError && (
                    <p className="text-xs text-cyan-400 font-mono mt-3 flex items-center gap-1.5 animate-float-in">
                      <AlertCircle className="w-3.5 h-3.5" /> {inputError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseEnter={handleHover}
                    className="absolute right-10 bottom-3 p-1 text-slate-400 hover:text-white transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>

                  <button
                    type="submit"
                    onMouseEnter={handleHover}
                    className="absolute right-0 bottom-3 p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </form>
              </motion.div>
            </div>
          )}

          {/* SIGNUP INITIALIZING PROGRESS ZOOM SEQUENCE */}
          {step === 'signup-initializing' && (
            <div className="flex flex-col items-center justify-center text-center max-w-lg w-full space-y-8">
              {/* Rushing Tunnel Scale Transform */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [1, 2, 4], opacity: [0.7, 1, 0] }}
                transition={{ duration: 2.5, ease: "easeIn" }}
                className="absolute inset-0 bg-cover bg-center -z-10"
                style={{ backgroundImage: `url(${heroTunnel})` }}
              />

              <h2 className="font-mono text-cyan-400 text-lg md:text-xl font-black tracking-[0.4em] uppercase animate-pulse">
                NEXUS INITIALIZING...
              </h2>
              
              <div className="w-full bg-white/5 border border-white/10 h-3 rounded-full overflow-hidden p-0.5 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${initializingProgress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full shadow-[0_0_8px_#00f0ff]"
                />
              </div>
              <p className="text-xs font-mono text-slate-500 tracking-wider">
                COMMENCING PROFILE SEEDING Telemetry — {initializingProgress}%
              </p>
            </div>
          )}

          {/* LOGIN WELCOME PROGRESS ZOOM SEQUENCE */}
          {step === 'login-welcome' && (
            <div className="flex flex-col items-center justify-center text-center max-w-lg w-full space-y-8">
              {/* Rushing Tunnel toward user Scale Transform */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [1, 2.5, 5], opacity: [0.8, 1, 0] }}
                transition={{ duration: 2.2, ease: "easeIn" }}
                className="absolute inset-0 bg-cover bg-center -z-10"
                style={{ backgroundImage: `url(${heroTunnel})` }}
              />

              <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-wide uppercase">
                WELCOME BACK, AGENT
              </h2>
              <p className="text-xs font-mono text-yellow-400 tracking-[0.2em] uppercase animate-pulse">
                SYNCHRONIZING OPERATING SYSTEM SESSION
              </p>

              <div className="w-full bg-white/5 border border-white/10 h-3 rounded-full overflow-hidden p-0.5 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${initializingProgress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-300 rounded-full shadow-[0_0_8px_#ffd700]"
                />
              </div>
              <p className="text-xs font-mono text-slate-500 tracking-wider">
                DECRYPTING CIPHER DATA KEYS — {initializingProgress}%
              </p>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
