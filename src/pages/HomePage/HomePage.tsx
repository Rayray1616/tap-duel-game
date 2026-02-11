import { useState, useEffect } from 'react';
import { useLaunchParams } from '@tma.js/sdk-react';
import { supabase } from '@/lib/supabase';
import { useEnergyRegeneration } from '@/hooks/useEnergyRegeneration';
import { WalletConnect } from '@/components/WalletConnect';
import type { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

export function HomePage() {
  const { initDataUnsafe } = useLaunchParams();
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
    const telegramUser = (initDataUnsafe as any)?.user;
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
    return <div className="flex justify-center items-center h-screen cyberpunk-loading">Loading...</div>;
  }

  const maxEnergy = 100 + (user?.energy_boost || 0);
  const energyPercentage = (energy / maxEnergy) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-cyan-400 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 cyberpunk-grid"></div>
      <div className="absolute inset-0 cyberpunk-scanlines"></div>
      <div className="absolute inset-0 cyberpunk-particles"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center pt-6 pb-4">
          <h1 className="text-6xl md:text-7xl font-black neon-text-cyan glitch-text mb-2">
            🔥 TAP DUEL 🔥
          </h1>
          <div className="text-xl md:text-2xl neon-text-cyan opacity-80">Cyberpunk Battle Arena</div>
        </div>

        {/* Wallet Connect */}
        <div className="px-4 mb-6">
          <WalletConnect />
        </div>

        {/* Stats Cards */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            {/* Player Card */}
            <div className="cyberpunk-card p-4">
              <div className="text-sm neon-text-cyan opacity-80 mb-1">PLAYER</div>
              <div className="text-lg font-bold neon-text-cyan">{user?.username || 'Anonymous'}</div>
            </div>
            
            {/* Level Card */}
            <div className="cyberpunk-card p-4">
              <div className="text-sm neon-text-cyan opacity-80 mb-1">LEVEL</div>
              <div className="text-lg font-bold neon-text-cyan">{user?.level || 1}</div>
            </div>
            
            {/* Score Card */}
            <div className="cyberpunk-card p-4">
              <div className="text-sm neon-text-cyan opacity-80 mb-1">SCORE</div>
              <div className="text-lg font-bold neon-text-cyan glitch-text">{user?.score || 0}</div>
            </div>
            
            {/* Multiplier Card */}
            <div className="cyberpunk-card p-4">
              <div className="text-sm neon-text-cyan opacity-80 mb-1">MULTI</div>
              <div className="text-lg font-bold neon-text-cyan">x{user?.tap_multiplier || 1.0}</div>
            </div>
          </div>
        </div>

        {/* Energy Bar */}
        <div className="px-4 mb-6">
          <div className="cyberpunk-card p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm neon-text-cyan opacity-80">ENERGY</span>
              <span className="text-sm neon-text-cyan">{energy}/{maxEnergy}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full cyberpunk-energy-bar transition-all duration-500"
                style={{ width: `${energyPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col justify-center px-4">
          {!gameActive ? (
            <div className="text-center">
              <button
                onClick={startGame}
                disabled={energy < 10}
                className="cyberpunk-button-start w-full max-w-sm mx-auto disabled:opacity-50 disabled:scale-100"
              >
                ⚡ START TAPPING (10 Energy) ⚡
              </button>
            </div>
          ) : (
            <div className="text-center">
              {/* Taps Display */}
              <div className="mb-8">
                <div className="text-8xl md:text-9xl font-black neon-text-cyan glitch-text animate-pulse mb-4">
                  {taps}
                </div>
                <div className="text-3xl md:text-4xl neon-text-cyan breathe-text">
                  ⚡ TIME: {timeLeft}s ⚡
                </div>
              </div>
              
              {/* Massive TAP Button */}
              <div className="relative inline-block">
                <button
                  onClick={handleTap}
                  className="cyberpunk-tap-button"
                >
                  <span className="cyberpunk-tap-text">TAP!</span>
                  <div className="cyberpunk-ripple"></div>
                  <div className="cyberpunk-glow"></div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="px-4 py-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.location.href = '/duel'}
              className="cyberpunk-nav-button"
            >
              ⚔️ DUEL
            </button>
            <button
              onClick={() => window.location.href = '/leaderboard'}
              className="cyberpunk-nav-button"
            >
              🏆 LEADERBOARD
            </button>
            <button
              onClick={() => window.location.href = '/rewards'}
              className="cyberpunk-nav-button"
            >
              🎁 REWARDS
            </button>
            <button
              onClick={() => window.location.href = '/shop'}
              className="cyberpunk-nav-button"
            >
              🛒 UPGRADES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
