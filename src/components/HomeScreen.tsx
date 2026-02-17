import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useTelegram } from '@/telegram/useTelegram';
import type { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

export function HomeScreen() {
  const { user: telegramUser } = useTelegram();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [energy, setEnergy] = useState(100);

  useEffect(() => {
    initializeUser();
  }, [telegramUser]);

  const initializeUser = async () => {
    if (!telegramUser?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id.toString())
        .single();

      if (existingUser) {
        setUser(existingUser);
        setEnergy(existingUser.energy);
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

  const handlePlay = () => {
    navigate('/matchmaking');
  };

  const handleFindOpponent = () => {
    navigate('/matchmaking');
  };

  const handleLeaderboard = () => {
    navigate('/leaderboard');
  };

  const handleRewards = () => {
    navigate('/rewards');
  };

  const handleShop = () => {
    navigate('/shop');
  };

  const handleProfile = () => {
    // Could navigate to profile or show profile modal
    console.log('Profile clicked');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-2xl font-bold animate-pulse">LOADING...</div>
      </div>
    );
  }

  const maxEnergy = 100 + (user?.energy_boost || 0);
  const energyPercentage = (energy / maxEnergy) * 100;

  return (
    <div className="min-h-screen bg-black text-cyan-400 flex flex-col relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0 cyberpunk-grid"></div>
        <div className="absolute inset-0 cyberpunk-particles"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col px-4 py-8">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse">
            TAP DUEL
          </h1>
          <div className="text-sm text-cyan-600 mt-2 tracking-widest">CYBERPUNK BATTLE ARENA</div>
        </div>

        {/* Main Play Button - Hexagonal */}
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={handlePlay}
            className="relative group transform transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="relative">
              {/* Hexagon shape using CSS */}
              <div className="hexagon-button">
                <div className="hexagon-content">
                  <span className="text-4xl md:text-5xl font-black text-white">PLAY</span>
                </div>
              </div>
              
              {/* Glow effects */}
              <div className="absolute inset-0 hexagon-glow group-hover:opacity-100"></div>
              <div className="absolute inset-0 hexagon-border group-hover:animate-pulse"></div>
            </div>
          </button>
        </div>

        {/* Secondary Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto w-full">
          <button
            onClick={handleFindOpponent}
            className="neon-button-secondary"
          >
            <span className="neon-text">FIND OPPONENT</span>
          </button>
          
          <button
            onClick={handleLeaderboard}
            className="neon-button-secondary"
          >
            <span className="neon-text">LEADERBOARD</span>
          </button>
          
          <button
            onClick={handleRewards}
            className="neon-button-secondary"
          >
            <span className="neon-text">REWARDS</span>
          </button>
          
          <button
            onClick={handleShop}
            className="neon-button-secondary"
          >
            <span className="neon-text">SHOP</span>
          </button>
        </div>

        {/* Profile Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleProfile}
            className="neon-button-profile"
          >
            <span className="neon-text">PROFILE</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar - Player Info & Energy */}
      <div className="relative z-10 border-t border-cyan-900/50 bg-black/80 backdrop-blur-md px-4 py-4">
        <div className="max-w-md mx-auto">
          {/* Player Info */}
          <div className="flex justify-between items-center mb-3">
            <div className="text-cyan-400">
              <div className="text-xs text-cyan-600 uppercase tracking-wider">Player</div>
              <div className="text-lg font-bold">{user?.username || 'Anonymous'}</div>
            </div>
            <div className="text-cyan-400 text-right">
              <div className="text-xs text-cyan-600 uppercase tracking-wider">Level</div>
              <div className="text-lg font-bold">{user?.level || 1}</div>
            </div>
            <div className="text-cyan-400 text-right">
              <div className="text-xs text-cyan-600 uppercase tracking-wider">Score</div>
              <div className="text-lg font-bold">{user?.score || 0}</div>
            </div>
          </div>

          {/* Energy Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-cyan-600 uppercase tracking-wider">Energy</span>
              <span className="text-xs text-cyan-400">{Math.round(energyPercentage)}%</span>
            </div>
            <div className="relative h-6 bg-gray-900 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 rounded-full"
                style={{ width: `${energyPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow-lg">
                  {energy}/{maxEnergy}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cyberpunk-grid {
          background-image: 
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 10s linear infinite;
        }

        .cyberpunk-particles {
          background-image: 
            radial-gradient(2px 2px at 20% 30%, rgba(0, 255, 255, 0.4), transparent),
            radial-gradient(2px 2px at 60% 70%, rgba(0, 255, 255, 0.4), transparent),
            radial-gradient(1px 1px at 50% 50%, rgba(0, 255, 255, 0.4), transparent);
          background-size: 200px 200px, 150px 150px, 100px 100px;
          animation: particles-float 30s linear infinite;
        }

        .hexagon-button {
          width: 200px;
          height: 200px;
          position: relative;
          clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
          background: linear-gradient(135deg, #00ffff 0%, #0088ff 50%, #0044aa 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .hexagon-content {
          position: relative;
          z-index: 2;
        }

        .hexagon-glow {
          position: absolute;
          inset: -20px;
          background: linear-gradient(135deg, #00ffff 0%, #0088ff 50%, #0044aa 100%);
          filter: blur(20px);
          opacity: 0;
          transition: opacity 0.3s ease;
          clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
        }

        .hexagon-border {
          position: absolute;
          inset: -2px;
          background: linear-gradient(45deg, #00ffff, #ff00ff, #00ffff);
          clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
          z-index: -1;
        }

        .neon-button-secondary {
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 136, 255, 0.1) 100%);
          border: 2px solid rgba(0, 255, 255, 0.5);
          border-radius: 12px;
          padding: 16px 12px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          font-size: 0.875rem;
          color: #00ffff;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .neon-button-secondary:hover {
          transform: scale(1.05);
          border-color: rgba(0, 255, 255, 0.8);
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.5),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
        }

        .neon-button-profile {
          background: linear-gradient(135deg, rgba(255, 0, 255, 0.1) 0%, rgba(136, 0, 255, 0.1) 100%);
          border: 2px solid rgba(255, 0, 255, 0.5);
          border-radius: 12px;
          padding: 12px 24px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          font-size: 0.875rem;
          color: #ff00ff;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .neon-button-profile:hover {
          transform: scale(1.05);
          border-color: rgba(255, 0, 255, 0.8);
          box-shadow: 
            0 0 20px rgba(255, 0, 255, 0.5),
            inset 0 0 20px rgba(255, 0, 255, 0.1);
        }

        .neon-text {
          text-shadow: 
            0 0 10px currentColor,
            0 0 20px currentColor,
            0 0 30px currentColor;
        }

        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        @keyframes particles-float {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-50px, 30px); }
          50% { transform: translate(30px, 50px); }
          75% { transform: translate(20px, -30px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  );
}
