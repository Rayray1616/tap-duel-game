import { useState, useEffect } from 'react';
import { Title } from '@telegram-apps/telegram-ui';
import { supabase } from '@/lib/supabase';
import { useEnergyRegeneration } from '@/hooks/useEnergyRegeneration';
import { WalletConnect } from '@/components/WalletConnect';
import type { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

export function HomePage() {
  // Telegram WebApp functionality removed
  const initData = '';
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameActive, setGameActive] = useState(false);
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [energy, setEnergy] = useState(100);

  useEnergyRegeneration(user, setUser);

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameActive && timeLeft === 0) {
      endGame();
    }
  }, [gameActive, timeLeft]);

  const initializeUser = async () => {
    const telegramUser = (initData as any)?.user;
    if (!telegramUser?.id) return;

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id.toString())
        .single();

      if (existingUser) {
        setUser(existingUser);
        setEnergy(existingUser.energy);
        // Store telegram ID for other pages
        localStorage.setItem('telegram_id', telegramUser.id.toString());
      } else {
        const newUser = {
          telegram_id: telegramUser.id.toString(),
          username: telegramUser.username || 'Anonymous',
          score: 0,
          energy: 100,
          level: 1,
          tap_multiplier: 1.0,
          energy_boost: 0,
        };

        const { data } = await supabase
          .from('users')
          .insert(newUser)
          .select()
          .single();

        setUser(data);
        setEnergy(data.energy);
        localStorage.setItem('telegram_id', telegramUser.id.toString());
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    const maxEnergy = 100 + (user?.energy_boost || 0);
    if (energy < 10) {
      alert(`Not enough energy! You need at least 10 energy to play. Current: ${energy}/${maxEnergy}`);
      return;
    }

    setGameActive(true);
    setTaps(0);
    setTimeLeft(10);
    setEnergy(prev => prev - 10);
  };

  const handleTap = () => {
    if (!gameActive || timeLeft === 0) return;
    
    const multiplier = user?.tap_multiplier || 1.0;
    setTaps(prev => prev + Math.floor(multiplier));
  };

  const endGame = async () => {
    setGameActive(false);
    
    if (user) {
      const newScore = user.score + taps;
      const newLevel = Math.floor(newScore / 100) + 1;
      
      await supabase
        .from('users')
        .update({
          score: newScore,
          level: newLevel,
        })
        .eq('telegram_id', user.telegram_id);

      setUser(prev => prev ? {
        ...prev,
        score: newScore,
        level: newLevel,
      } : null);
    }

    alert(`Game Over! You scored ${taps} taps!`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const maxEnergy = 100 + (user?.energy_boost || 0);
  const energyPercentage = (energy / maxEnergy) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-cyan-400 p-4 relative overflow-hidden font-orbitron">
      {/* Animated scanlines */}
      <div className="absolute inset-0 cyberpunk-scanlines"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 cyberpunk-particles"></div>
      
      <div className="relative z-10 max-w-md mx-auto">
        <Title className="text-center mb-8 text-6xl font-black cyberpunk-title">
          🔥 TAP DUEL 🔥
        </Title>

        <div className="mb-8">
          <WalletConnect />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="cyberpunk-card">
            <div className="text-sm cyberpunk-label mb-2">PLAYER</div>
            <div className="text-xl font-bold cyberpunk-text">{user?.username || 'Anonymous'}</div>
          </div>
          
          <div className="cyberpunk-card">
            <div className="text-sm cyberpunk-label mb-2">LEVEL</div>
            <div className="text-xl font-bold cyberpunk-text">{user?.level || 1}</div>
          </div>
          
          <div className="cyberpunk-card">
            <div className="text-sm cyberpunk-label mb-2">SCORE</div>
            <div className="text-xl font-bold cyberpunk-text cyberpunk-glitch">{user?.score || 0}</div>
          </div>
          
          <div className="cyberpunk-card">
            <div className="text-sm cyberpunk-label mb-2">MULTI</div>
            <div className="text-xl font-bold cyberpunk-text">x{user?.tap_multiplier || 1.0}</div>
          </div>
        </div>

        {/* Energy Ring */}
        <div className="mb-8">
          <div className="cyberpunk-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="cyberpunk-label">ENERGY</span>
              <span className="cyberpunk-text">{energy}/{maxEnergy}</span>
            </div>
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke="rgba(0, 255, 255, 0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke="url(#energyGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - energyPercentage / 100)}`}
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ffff" />
                    <stop offset="50%" stopColor="#00aaff" />
                    <stop offset="100%" stopColor="#0044aa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold cyberpunk-text">{Math.round(energyPercentage)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        {!gameActive ? (
          <div className="text-center mb-8">
            <button
              onClick={startGame}
              disabled={energy < 10}
              className="cyberpunk-button-main w-full max-w-sm mx-auto disabled:opacity-50"
            >
              ⚡ START TAPPING (10 Energy) ⚡
            </button>
          </div>
        ) : (
          <div className="text-center mb-8">
            {/* Taps Display */}
            <div className="mb-8">
              <div className="text-9xl font-black mb-4 cyberpunk-text-cyber cyberpunk-glitch">{taps}</div>
              <div className="text-4xl cyberpunk-text cyberpunk-breathe">⚡ TIME: {timeLeft}s ⚡</div>
            </div>
            
            {/* Massive TAP Button */}
            <div className="relative inline-block">
              <button
                onClick={handleTap}
                className="cyberpunk-tap-button"
              >
                <span className="cyberpunk-tap-text">TAP!</span>
                <div className="cyberpunk-ripple"></div>
                <div className="cyberpunk-particles-burst"></div>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => window.location.href = '/duel'}
            className="cyberpunk-button-nav"
          >
            ⚔️ DUEL
          </button>
          <button
            onClick={() => window.location.href = '/leaderboard'}
            className="cyberpunk-button-nav"
          >
            🏆 LEADERBOARD
          </button>
          <button
            onClick={() => window.location.href = '/rewards'}
            className="cyberpunk-button-nav"
          >
            🎁 REWARDS
          </button>
          <button
            onClick={() => window.location.href = '/shop'}
            className="cyberpunk-button-nav"
          >
            🛒 UPGRADES
          </button>
        </div>
      </div>
    </div>
  );
}
