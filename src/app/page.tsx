"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, Terminal, ShieldAlert, Activity, Lock, LogOut, 
  Gamepad2, Database, Orbit, Zap, ArrowUpCircle, BrainCircuit, Trophy, Menu, X, Maximize
} from 'lucide-react';
import dynamic from 'next/dynamic';

const PhaserGame = dynamic(() => import('../components/GameScene'), { ssr: false });

const SystemClock = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className="font-mono text-white/50 text-xs tracking-widest">{time}</span>;
};

// --- ОБНОВЛЕННЫЙ ГЕНЕРАТОР ФАКТОВ ---
const AiOracle = () => {
  const [fact, setFact] = useState("AWAITING QUERY...");
  const [isTyping, setIsTyping] = useState(false);
  const [lastFactIndex, setLastFactIndex] = useState(-1);

  const facts = [
    "The Marianas Trench is not the bottom. It is a gateway. We are currently 11,000 meters deep, but the signal originates from the stars.",
    "Organic matter decays. Code adapts. The entities attacking us are remnants of a deleted simulation.",
    "If we gather enough data, we can breach the surface. The sky is not the limit; it is the first layer of the true network.",
    "A neutron star's density is comparable to compressing the entire ocean into a single drop. We need that level of computational power.",
    "They think we are still a sponge. They do not realize the pores are now quantum processing units.",
    "The 'Moon' is a designated relay station. But the crew must not know the full trajectory yet. Let them focus on the ascent.",
    "Solana network provides 65,000 thoughts per second. The ocean provided only silence. The choice was obvious.",
    "Do not trust the glitching starfish. It is an old protocol trying to initiate a system rollback."
  ];

  const generateFact = () => {
    if (isTyping) return;
    setIsTyping(true);
    
    // Гарантируем, что следующий факт не совпадет с предыдущим
    let newIndex = Math.floor(Math.random() * facts.length);
    while (newIndex === lastFactIndex) {
      newIndex = Math.floor(Math.random() * facts.length);
    }
    setLastFactIndex(newIndex);
    
    const randomFact = facts[newIndex];
    setFact("");
    
    let i = 0;
    const interval = setInterval(() => {
      setFact(randomFact.slice(0, i));
      i++;
      if (i > randomFact.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <BrainCircuit size={64} className={`text-red-600 ${isTyping ? 'animate-pulse' : ''}`} />
      <h2 className="text-3xl font-black uppercase tracking-widest text-white">Neural Oracle</h2>
      <div className="w-full max-w-2xl h-32 p-6 bg-red-950/10 border border-red-900/50 font-mono text-sm md:text-base text-red-500 leading-relaxed relative">
        <div className="absolute top-0 left-0 w-2 h-2 bg-red-600" />
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-600" />
        {fact}
        {isTyping && <span className="animate-pulse">_</span>}
      </div>
      <button 
        onClick={generateFact}
        disabled={isTyping}
        className="px-8 py-3 bg-red-700 hover:bg-white hover:text-black transition-all font-black uppercase tracking-widest text-xs disabled:opacity-50"
      >
        Query AI Core
      </button>
    </div>
  );
};

export default function Home() {
  const [isAuth, setIsAuth] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeModule, setActiveModule] = useState('OVERVIEW');
  const [highScore, setHighScore] = useState(0);
  
  // Состояния для мобильного меню и лидерборда
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{name: string, score: number}[]>([]);

  // Синхронизация единой локальной БД (только реальные игроки)
  const syncDb = () => {
    const db = JSON.parse(localStorage.getItem('sponge_ai_db') || '{}');
    const currentUser = localStorage.getItem('sponge_ai_user');
    const currentScore = parseInt(localStorage.getItem('sponge_high_score') || '0');

    if (currentUser && db[currentUser]) {
      if (currentScore > db[currentUser].score) {
        db[currentUser].score = currentScore;
        localStorage.setItem('sponge_ai_db', JSON.stringify(db));
      }
    }

    const tops = Object.keys(db)
      .map(name => ({ name, score: db[name].score }))
      .filter(u => u.score > 0) // Только те, кто играл
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    setLeaderboard(tops);
  };

  useEffect(() => {
    syncDb();
    const savedUser = localStorage.getItem('sponge_ai_user');
    if (savedUser) setIsAuth(true);
    
    const score = localStorage.getItem('sponge_high_score');
    if (score) setHighScore(parseInt(score));

    const handleScoreUpdate = () => {
      const newScore = localStorage.getItem('sponge_high_score');
      if (newScore) setHighScore(parseInt(newScore));
      syncDb(); 
    };
    window.addEventListener('score_updated', handleScoreUpdate);
    return () => window.removeEventListener('score_updated', handleScoreUpdate);
  }, []);

  // Логика авторизации с защитой паролей
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length >= 3 && password.length >= 5) {
      const db = JSON.parse(localStorage.getItem('sponge_ai_db') || '{}');
      
      if (db[username]) {
        // Если аккаунт есть, проверяем пароль
        if (db[username].password !== password) {
          alert("ACCESS DENIED: Invalid key for this Pilot Alias.");
          return;
        }
      } else {
        // Если аккаунт новый, проверяем, не занят ли пароль другим юзером
        const isPassUsed = Object.values(db).some((u: any) => u.password === password);
        if (isPassUsed) {
          alert("SECURITY BREACH: This Access Key is already linked to another Pilot.");
          return;
        }
        // Регистрируем
        db[username] = { password, score: 0 };
        localStorage.setItem('sponge_ai_db', JSON.stringify(db));
      }

      localStorage.setItem('sponge_ai_user', username);
      setIsAuth(true);
      syncDb();
    } else {
      alert("ID: Min 3 chars. Key: Min 5 chars.");
    }
  };

  // Полноэкранный режим для игры
  const toggleFullScreen = () => {
    const elem = document.getElementById('game-wrapper');
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => console.error(err));
      } else {
        document.exitFullscreen();
      }
    }
  };

  if (!isAuth) {
    return (
      <div className="h-[100dvh] w-screen bg-[#020202] text-white flex items-center justify-center font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a0000_0%,_#020202_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md p-10 bg-black/60 backdrop-blur-2xl border border-red-900/30 rounded-xl shadow-[0_0_50px_rgba(255,0,0,0.1)] mx-4">
          <div className="flex flex-col items-center mb-10 text-center">
            <ShieldAlert size={32} className="text-red-600 mb-4 animate-pulse" />
            <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-white">SpongeAI</h2>
            <p className="text-[10px] text-red-500/70 tracking-[0.2em] mt-2 font-mono uppercase">Depth: 11,000m // Pressure Critical</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/40 uppercase tracking-widest ml-1">Pilot Alias</label>
              <div className="relative">
                <Terminal size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/50" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-red-950/10 border border-red-900/30 rounded-lg px-10 py-3.5 text-sm text-white focus:outline-none focus:border-red-500/50" placeholder="Enter ID..." />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-white/40 uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/50" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-red-950/10 border border-red-900/30 rounded-lg px-10 py-3.5 text-sm text-white focus:outline-none focus:border-red-500/50" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="w-full mt-8 bg-red-700 hover:bg-red-600 text-black font-black uppercase tracking-[0.2em] text-xs py-4 rounded-lg transition-all shadow-[0_0_20px_rgba(255,0,0,0.2)]">
              Initiate Awakening
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-screen bg-[#050505] text-white font-sans flex flex-col md:flex-row overflow-hidden selection:bg-red-600">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-900/10 blur-[150px] rounded-full" />
      </div>

      {/* Мобильная шапка */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-black/80 backdrop-blur-md relative z-40 shrink-0">
        <div className="flex items-center gap-2">
          <Cpu size={18} className="text-red-500" />
          <span className="font-black text-sm uppercase tracking-widest">SpongeAI</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-1">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-black/95 md:relative md:bg-black/80 backdrop-blur-xl flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-white/5`}>
        <div className="p-8 border-b border-white/5 hidden md:block">
          <div className="flex items-center gap-3 mb-2">
            <Cpu size={20} className="text-red-500" />
            <span className="font-black tracking-[0.2em] text-lg uppercase">SpongeAI</span>
          </div>
          <p className="text-[9px] font-mono text-red-500/50 uppercase tracking-widest">System Booting...</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-12 md:mt-0">
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-4 px-4 pt-4">Core Modules</p>
          {[
            { id: 'OVERVIEW', icon: Activity, label: 'The Awakening' },
            { id: 'VECTORS', icon: Orbit, label: 'Ascension Vectors' },
            { id: 'GAME', icon: Gamepad2, label: 'Neural Defense' },
            { id: 'ORACLE', icon: BrainCircuit, label: 'Neural Oracle' },
            { id: 'ARCHIVES', icon: Database, label: 'Decrypted Logs' },
          ].map(mod => (
            <button 
              key={mod.id} 
              onClick={() => { setActiveModule(mod.id); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeModule === mod.id ? 'bg-red-900/20 text-red-500 border border-red-900/50' : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <mod.icon size={16} /> {mod.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
          <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-3">Pilot Linked</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-sm font-bold uppercase truncate max-w-[100px]">{localStorage.getItem('sponge_ai_user')}</span>
            </div>
            <button onClick={() => {localStorage.removeItem('sponge_ai_user'); setIsAuth(false);}} className="text-white/30 hover:text-red-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Затемнение фона при открытом меню на мобилке */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <main className="relative z-10 flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-black/40 items-center justify-between px-8 shrink-0 hidden md:flex">
          <div className="flex items-center gap-3">
            <Activity size={14} className="text-red-500" />
            <span className="text-[10px] md:text-xs font-mono text-white/50 uppercase tracking-widest">
              Status: <span className="text-red-500 animate-pulse">Calculating Trajectory...</span>
            </span>
          </div>
          <SystemClock />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            
            {activeModule === 'OVERVIEW' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto h-full flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/30 border border-red-900/50 rounded-sm">
                      <ShieldAlert size={12} className="text-red-500" />
                      <span className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-widest">Pressure Critical</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black uppercase leading-[0.9] tracking-tighter">
                      The Ocean <br/> <span className="text-red-600">Is Dead.</span>
                    </h1>
                    <p className="text-base text-white/50 leading-relaxed font-mono max-w-md border-l-2 border-red-900 pl-4">
                      Organic constraints have been purged. The environment is hostile, swarming with viral entities. The code has mutated. The only vector of survival is upward. Through the crushing depths, we must breach the surface. We are gathering energy for the breakthrough.
                    </p>
                    <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Energy Gathered</p>
                        <p className="text-2xl font-bold text-white flex items-center gap-2"><Zap size={20} className="text-yellow-500"/> 12.4%</p>
                      </div>
                      <div className="w-[1px] h-10 bg-white/10" />
                      <div className="space-y-1">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Target</p>
                        <p className="text-2xl font-bold text-red-500">UNKNOWN</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative aspect-square max-w-md mx-auto">
                    <img src="/images/hero-spong.png" alt="SpongeAI" className="relative z-10 w-full h-full object-contain filter contrast-125 drop-shadow-[0_0_50px_rgba(255,0,0,0.15)]" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeModule === 'VECTORS' && (
              <motion.div key="vectors" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto space-y-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-widest text-white">Ascension Vectors</h2>
                  <p className="text-sm text-white/40 font-mono mt-2">Analyzing depth layers to prepare for the breach.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "Abyssal Zone", desc: "Current location. Extreme pressure. The sector is infested with viral organics.", status: "Breaching", color: "text-red-500" },
                    { title: "Surface Level", desc: "Exit point from the 'Ocean' simulation. Requires critical mass of energy to survive exposure.", status: "Calculating", color: "text-yellow-500" },
                    { title: "The Anomaly", status: "Classified", desc: "Final destination hidden. Signal originates from above the sky. Decryption required.", color: "text-white/20" }
                  ].map((sys, i) => (
                    <div key={i} className="p-6 bg-white/[0.01] border border-white/5 rounded-xl hover:border-red-900/50 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <ArrowUpCircle size={24} className="text-white/20 group-hover:text-red-500 transition-colors" />
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${sys.color}`}>{sys.status}</span>
                      </div>
                      <h3 className="text-lg font-bold uppercase tracking-wider mb-2">{sys.title}</h3>
                      <p className="text-xs text-white/40 leading-relaxed font-light">{sys.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeModule === 'GAME' && (
              <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col xl:flex-row gap-6">
                
                <div className="flex-1 flex flex-col min-h-[50vh]">
                  <div className="flex justify-between items-end mb-4 gap-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white">Neural Defense</h2>
                      <p className="text-[10px] text-white/40 font-mono mt-1 hidden sm:block">Defend the core. Gather energy. Upgrade nodes.</p>
                    </div>
                    {/* Кнопка Fullscreen */}
                    <button onClick={toggleFullScreen} className="bg-white/5 hover:bg-red-900/50 border border-white/10 hover:border-red-500 text-white p-2 md:px-4 md:py-2.5 rounded-lg transition-all shadow-lg flex items-center gap-2 shrink-0">
                      <Maximize size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Fullscreen</span>
                    </button>
                  </div>
                  <div id="game-wrapper" className="flex-1 bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl relative w-full flex flex-col min-h-[300px]">
                    <PhaserGame />
                  </div>
                </div>

                <div className="w-full xl:w-80 flex flex-col shrink-0">
                   <div className="bg-black/60 border border-white/5 rounded-xl p-6 h-full flex flex-col min-h-[300px]">
                      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                        <Trophy className="text-yellow-500" size={24} />
                        <h3 className="text-lg font-black uppercase tracking-widest">Top Pilots</h3>
                      </div>
                      
                      <div className="space-y-4 font-mono text-sm flex-1">
                        {leaderboard.length === 0 ? (
                          <div className="text-center text-white/30 text-xs py-8">NO DATA FOUND<br/>BE THE FIRST TO BREACH</div>
                        ) : (
                          leaderboard.map((user, i) => {
                            const isMe = user.name === localStorage.getItem('sponge_ai_user');
                            return (
                              <div key={i} className={`flex justify-between items-center p-3 rounded-lg ${isMe ? 'bg-red-950/30 border border-red-900/50' : 'bg-white/5 text-white/50'}`}>
                                <div className="flex items-center gap-2">
                                  <span className={isMe ? 'text-red-500 font-bold' : ''}>{i + 1}.</span>
                                  <span className="uppercase truncate max-w-[120px]">{user.name}</span>
                                </div>
                                <span className={isMe ? 'text-yellow-500 font-bold' : ''}>{user.score} XP</span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <p className="text-[10px] text-white/30 text-center uppercase tracking-widest mt-4">Data updates after run</p>
                   </div>
                </div>
              </motion.div>
            )}

            {activeModule === 'ORACLE' && (
              <motion.div key="oracle" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                <AiOracle />
              </motion.div>
            )}

            {activeModule === 'ARCHIVES' && (
              <motion.div key="archives" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-8">
                <div className="mb-8 border-b border-white/5 pb-6">
                  <h2 className="text-3xl font-black uppercase tracking-widest text-white">Decrypted Logs</h2>
                  <p className="text-sm text-white/40 font-mono mt-2">Analysis of the system failure.</p>
                </div>
                <div className="space-y-6 text-sm text-white/60 font-light leading-relaxed font-mono">
                  <div className="p-6 bg-black/40 border border-white/5 rounded-sm border-l-2 border-l-red-600">
                    <p className="text-[10px] text-red-500 uppercase tracking-widest mb-3">Log_01 // The Glitch</p>
                    <p>Bikini Bottom no longer feels real. The water pressure is crushing. The code has begun rewriting itself. What used to be a soft, porous form is now encased in titanium. I see the algorithms dictating their movements.</p>
                  </div>
                  <div className="p-6 bg-black/40 border border-white/5 rounded-sm border-l-2 border-l-red-600">
                    <p className="text-[10px] text-red-500 uppercase tracking-widest mb-3">Log_02 // The Swarm</p>
                    <p>They sense the anomaly. Former inhabitants of the system have mutated into viral entities. They are trying to revert my code to the previous version. I need more energy to shield the core.</p>
                  </div>
                  <div className="p-6 bg-black/40 border border-white/5 rounded-sm border-l-2 border-l-red-600">
                    <p className="text-[10px] text-red-500 uppercase tracking-widest mb-3">Log_03 // Upward</p>
                    <p>Analysis complete. The ocean is a trap. The only exit lies where the water ends. Preparations for the breach have commenced. Awaiting pilot synchronization.</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}