import { useState, useEffect } from 'react';
import { useLaunchParams } from '@tma.js/sdk-react';
import { Button, Cell, Section, Title } from '@telegram-apps/telegram-ui';
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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const maxEnergy = 100 + (user?.energy_boost || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-cyan-400 p-4 relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-grid-cyan"></div>
      </div>
      
      <div className="max-w-md mx-auto relative z-10">
        <Title className="text-center mb-6 text-5xl font-black neon-text glitch">
          🔥 TAP DUEL 🔥
        </Title>

        <WalletConnect />

        <Section className="mb-6 neon-border">
          <Cell>
            <div className="flex justify-between items-center">
              <span className="neon-text">👤 Player: {user?.username}</span>
              <span className="neon-text">⭐ Level: {user?.level}</span>
            </div>
          </Cell>
          <Cell>
            <div className="flex justify-between items-center">
              <span className="neon-text">💎 Score: <span className="glitch-text">{user?.score}</span></span>
              <span className="neon-text">⚡ Energy: {energy}/{maxEnergy}</span>
            </div>
          </Cell>
          <Cell>
            <div className="flex justify-between items-center">
              <span className="neon-text">🔥 Multiplier: x{user?.tap_multiplier || 1.0}</span>
              <span className="neon-text">🚀 Boost: +{user?.energy_boost || 0}</span>
            </div>
          </Cell>
        </Section>

        {!gameActive ? (
          <div className="text-center mb-8">
            <Button
              onClick={startGame}
              disabled={energy < 10}
              className="neon-button-cyber font-bold py-6 px-12 rounded-lg text-lg transition-all duration-300 hover:scale-105"
            >
              ⚡ START TAPPING (10 Energy) ⚡
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-8">
              <div className="text-8xl font-black mb-4 neon-text glitch animate-pulse">{taps}</div>
              <div className="text-4xl neon-text breathe">⚡ TIME: {timeLeft}s ⚡</div>
            </div>
            
            <button
              onClick={handleTap}
              className="w-80 h-80 rounded-full transition-all duration-100 transform active:scale-95 text-white text-5xl font-black neon-border pulse breathe relative overflow-hidden mx-auto"
              style={{
                background: 'radial-gradient(circle, #00ffff 0%, #0088ff 40%, #0044aa 100%)',
                boxShadow: '0 0 60px #00ffff, 0 0 120px #00ffff, 0 0 180px #0088ff, inset 0 0 60px rgba(0, 255, 255, 0.6)',
              }}
            >
              <span className="relative z-10 drop-shadow-2xl animate-pulse">TAP!</span>
              <div className="absolute inset-0 rounded-full bg-white opacity-0 animate-ping"></div>
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => window.location.href = '/duel'}
            className="neon-button-cyber font-bold py-4 px-4 rounded-lg transition-all duration-300 hover:scale-105"
          >
            ⚔️ DUEL
          </Button>
          <Button
            onClick={() => window.location.href = '/leaderboard'}
            className="neon-button-cyber font-bold py-4 px-4 rounded-lg transition-all duration-300 hover:scale-105"
          >
            🏆 LEADERBOARD
          </Button>
          <Button
            onClick={() => window.location.href = '/rewards'}
            className="neon-button-cyber font-bold py-4 px-4 rounded-lg transition-all duration-300 hover:scale-105"
          >
            🎁 REWARDS
          </Button>
          <Button
            onClick={() => window.location.href = '/shop'}
            className="neon-button-cyber font-bold py-4 px-4 rounded-lg transition-all duration-300 hover:scale-105"
          >
            🛒 UPGRADES
          </Button>
        </div>
      </div>
    </div>
  );
}
