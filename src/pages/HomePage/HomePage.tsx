import { useState, useEffect } from 'react';
import { useLaunchParams } from '@tma.js/sdk-react';
import { Button, Cell, Section, Title } from '@telegram-apps/telegram-ui';
import { supabase } from '@/lib/supabase';
import { useEnergyRegeneration } from '@/hooks/useEnergyRegeneration';
import { WalletConnect } from '@/components/WalletConnect/WalletConnect';
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
    <div className="min-h-screen bg-black text-cyan-400 p-4">
      <div className="max-w-md mx-auto">
        <Title className="text-center mb-6 text-cyan-400 font-bold neon-text">
          🔥 TAP DUEL 🔥
        </Title>

        <WalletConnect />

        <Section className="mb-4">
          <Cell>
            <div className="flex justify-between items-center">
              <span>Player: {user?.username}</span>
              <span>Level: {user?.level}</span>
            </div>
          </Cell>
          <Cell>
            <div className="flex justify-between items-center">
              <span>Score: {user?.score}</span>
              <span>Energy: {energy}/{maxEnergy}</span>
            </div>
          </Cell>
          <Cell>
            <div className="flex justify-between items-center">
              <span>Multiplier: x{user?.tap_multiplier || 1.0}</span>
              <span>Energy Boost: +{user?.energy_boost || 0}</span>
            </div>
          </Cell>
        </Section>

        {!gameActive ? (
          <div className="text-center">
            <Button
              onClick={startGame}
              disabled={energy < 10}
              className="neon-button pulse font-bold py-4 px-8 rounded-lg"
            >
              START TAPPING (10 Energy)
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <div className="text-6xl font-bold text-cyan-300 mb-2 neon-text">{taps}</div>
              <div className="text-2xl text-cyan-400 neon-text">Time: {timeLeft}s</div>
            </div>
            
            <button
              onClick={handleTap}
              className="w-48 h-48 bg-cyan-600 hover:bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/50 transition-all duration-100 transform active:scale-95 text-white text-2xl font-bold neon-border pulse"
              style={{
                boxShadow: '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 30px rgba(0, 255, 255, 0.2)',
              }}
            >
              TAP!
            </button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button
            onClick={() => window.location.href = '/duel'}
            className="bg-purple-600 hover:bg-purple-500 text-white neon-button"
          >
            ⚔️ DUEL
          </Button>
          <Button
            onClick={() => window.location.href = '/leaderboard'}
            className="bg-green-600 hover:bg-green-500 text-white neon-button"
          >
            🏆 LEADERBOARD
          </Button>
          <Button
            onClick={() => window.location.href = '/rewards'}
            className="bg-yellow-600 hover:bg-yellow-500 text-white neon-button"
          >
            🎁 REWARDS
          </Button>
          <Button
            onClick={() => window.location.href = '/shop'}
            className="bg-orange-600 hover:bg-orange-500 text-white neon-button"
          >
            🛒 UPGRADES
          </Button>
        </div>
      </div>
    </div>
  );
}
