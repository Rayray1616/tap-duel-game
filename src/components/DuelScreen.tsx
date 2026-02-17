import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDuelClient } from '@/realtime/DuelClient';
import { useTelegram } from '@/telegram/useTelegram';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

interface DuelScreenProps {
  duelId?: string;
  playerId?: string;
}

export function DuelScreen({ duelId: propDuelId, playerId: propPlayerId }: DuelScreenProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: telegramUser } = useTelegram();
  
  // Get duelId and playerId from props or URL params
  const duelId = propDuelId || searchParams.get('duelId') || '';
  const playerId = propPlayerId || searchParams.get('playerId') || telegramUser?.id?.toString() || '';
  
  // Duel state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [duelEnded, setDuelEnded] = useState(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);
  const [showHitFlash, setShowHitFlash] = useState(false);
  const [showParticleBurst, setShowParticleBurst] = useState(false);
  const tapAreaRef = useRef<HTMLDivElement>(null);

  // WebSocket duel client
  const {
    state,
    countdown,
    players,
    taps,
    result,
    sendTap
  } = useDuelClient(duelId, playerId);

  useEffect(() => {
    initializeUser();
  }, [telegramUser]);

  useEffect(() => {
    if (result) {
      setDuelEnded(true);
      setWinner(result.winner_id === playerId ? 'player' : 'opponent');
    }
  }, [result, playerId]);

  const initializeUser = async () => {
    if (!telegramUser?.id) {
      setLoading(false);
      return;
    }

    try {
      const telegramId = telegramUser.id.toString();
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      setUser(data);
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTap = () => {
    if (state !== 'active' || duelEnded) return;
    
    // Trigger visual effects
    setShowHitFlash(true);
    setShowParticleBurst(true);
    
    // Send tap to server
    sendTap();
    
    // Clear visual effects
    setTimeout(() => setShowHitFlash(false), 100);
    setTimeout(() => setShowParticleBurst(false), 800);
  };

  const handleRematch = () => {
    navigate('/matchmaking');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-2xl font-bold animate-pulse">LOADING DUEL...</div>
      </div>
    );
  }

  if (!duelId || !playerId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-xl text-center">
          <div>Invalid duel parameters</div>
          <button 
            onClick={handleBackToHome}
            className="mt-4 px-6 py-2 bg-red-900 text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const playerTaps = taps[playerId] || 0;
  const opponentId = players.find(id => id !== playerId);
  const opponentTaps = opponentId ? taps[opponentId] || 0 : 0;
  const opponentName = opponentId ? `Player ${opponentId.slice(-4)}` : 'Waiting...';
  const maxTaps = 100; // Maximum taps for progress bars
  const playerProgress = Math.min((playerTaps / maxTaps) * 100, 100);
  const opponentProgress = Math.min((opponentTaps / maxTaps) * 100, 100);

  return (
    <div className="min-h-screen bg-black text-cyan-400 flex flex-col relative overflow-hidden">
      
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0 cyberpunk-grid"></div>
        <div className="absolute inset-0 cyberpunk-particles"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col px-4 py-6">
        
        {/* Opponent Section */}
        <div className="text-center mb-6">
          <div className="text-sm text-cyan-600 uppercase tracking-wider mb-2">Opponent</div>
          <div className="text-2xl font-bold text-pink-400 mb-4">{opponentName}</div>
          
          {/* Timer */}
          <div className="text-6xl font-black mb-4">
            {countdown !== null ? (
              <span className={`timer-text ${countdown <= 5 ? 'timer-urgent' : ''}`}>
                {countdown}
              </span>
            ) : state === 'waiting' ? (
              <span className="text-cyan-600">WAITING</span>
            ) : state === 'countdown' ? (
              <span className="text-yellow-400 animate-pulse">READY</span>
            ) : (
              <span className="text-green-400">FIGHT!</span>
            )}
          </div>

          {/* Opponent Progress Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-pink-400">Opponent</span>
              <span className="text-pink-400">{opponentTaps}/{maxTaps}</span>
            </div>
            <div className="relative h-4 bg-gray-900 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-300 rounded-full"
                style={{ width: `${opponentProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Area */}
        <div className="flex-1 flex items-center justify-center relative">
          
          {/* Hit Flash Effect */}
          {showHitFlash && (
            <div className="absolute inset-0 hit-flash-effect pointer-events-none"></div>
          )}
          
          {/* Particle Burst Effect */}
          {showParticleBurst && (
            <div className="absolute inset-0 particle-burst pointer-events-none"></div>
          )}
          
          {/* Tap Area */}
          <div
            ref={tapAreaRef}
            onClick={handleTap}
            className={`tap-area ${state === 'active' && !duelEnded ? 'tap-area-active' : 'tap-area-disabled'}`}
          >
            <div className="text-center">
              <div className="text-8xl md:text-9xl font-black mb-4 tap-counter">
                {playerTaps}
              </div>
              <div className="text-xl md:text-2xl font-bold uppercase tracking-wider">
                {state === 'active' && !duelEnded ? 'TAP!' : 
                 state === 'waiting' ? 'WAITING' :
                 state === 'countdown' ? 'GET READY' :
                 duelEnded ? 'FINISHED' : 'READY'}
              </div>
            </div>
          </div>
        </div>

        {/* Player Section */}
        <div className="mt-6">
          {/* Player Progress Bar */}
          <div className="max-w-md mx-auto mb-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-cyan-400">{user?.username || 'You'}</span>
              <span className="text-cyan-400">{playerTaps}/{maxTaps}</span>
            </div>
            <div className="relative h-4 bg-gray-900 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${playerProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* End of Duel Overlay */}
      {duelEnded && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-20">
          <div className="text-center px-4">
            {/* Win/Lose Banner */}
            <div className={`result-banner ${winner === 'player' ? 'win-banner' : 'lose-banner'}`}>
              <div className="text-6xl md:text-8xl font-black mb-4">
                {winner === 'player' ? '🏆' : '💀'}
              </div>
              <div className="text-4xl md:text-6xl font-black mb-2">
                {winner === 'player' ? 'VICTORY!' : 'DEFEAT!'}
              </div>
              <div className="text-xl mb-6">
                {playerTaps} vs {opponentTaps} taps
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-4 max-w-sm mx-auto">
              <button
                onClick={handleRematch}
                className="w-full neon-button-primary"
              >
                REMATCH
              </button>
              <button
                onClick={handleBackToHome}
                className="w-full neon-button-secondary"
              >
                BACK TO HOME
              </button>
            </div>
          </div>
        </div>
      )}

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

        .timer-text {
          color: #00ffff;
          text-shadow: 
            0 0 20px #00ffff,
            0 0 40px #00ffff;
          font-family: 'Orbitron', monospace;
        }

        .timer-urgent {
          color: #ff4444;
          text-shadow: 
            0 0 20px #ff4444,
            0 0 40px #ff4444;
          animation: timer-pulse 1s ease-in-out infinite;
        }

        .tap-area {
          width: 250px;
          height: 250px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          transition: all 0.1s ease;
          user-select: none;
        }

        .tap-area-active {
          background: linear-gradient(135deg, #00ffff 0%, #0088ff 50%, #0044aa 100%);
          border: 4px solid #00ffff;
          box-shadow: 
            0 0 40px #00ffff,
            inset 0 0 40px rgba(0, 255, 255, 0.3);
          animation: tap-pulse 2s ease-in-out infinite;
        }

        .tap-area-active:hover {
          transform: scale(1.05);
          box-shadow: 
            0 0 60px #00ffff,
            inset 0 0 60px rgba(0, 255, 255, 0.4);
        }

        .tap-area-active:active {
          transform: scale(0.95);
        }

        .tap-area-disabled {
          background: linear-gradient(135deg, #333 0%, #222 50%, #111 100%);
          border: 4px solid #444;
          cursor: not-allowed;
        }

        .tap-counter {
          color: white;
          text-shadow: 
            0 0 20px rgba(255, 255, 255, 0.8),
            2px 2px 8px rgba(0, 0, 0, 0.8);
          font-family: 'Orbitron', monospace;
        }

        .hit-flash-effect {
          background: radial-gradient(circle, rgba(0, 255, 255, 0.4) 0%, transparent 70%);
          animation: hit-flash 0.1s ease-out;
        }

        .particle-burst {
          animation: particle-burst 0.8s ease-out;
        }

        .result-banner {
          padding: 2rem;
          border-radius: 20px;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }

        .win-banner {
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 255, 0, 0.1) 100%);
          border: 3px solid #00ff00;
          box-shadow: 
            0 0 40px #00ff00,
            inset 0 0 40px rgba(0, 255, 0, 0.2);
          animation: win-glow 2s ease-in-out infinite;
        }

        .lose-banner {
          background: linear-gradient(135deg, rgba(255, 0, 0, 0.2) 0%, rgba(255, 0, 0, 0.1) 100%);
          border: 3px solid #ff0000;
          box-shadow: 
            0 0 40px #ff0000,
            inset 0 0 40px rgba(255, 0, 0, 0.2);
          animation: lose-glow 2s ease-in-out infinite;
        }

        .neon-button-primary {
          background: linear-gradient(135deg, #00ffff 0%, #0088ff 50%, #0044aa 100%);
          border: none;
          padding: 16px 24px;
          font-family: 'Orbitron', monospace;
          font-size: 1rem;
          font-weight: 900;
          color: #000;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 
            0 0 20px #00ffff,
            inset 0 0 20px rgba(0, 255, 255, 0.3);
        }

        .neon-button-primary:hover {
          transform: scale(1.05);
          box-shadow: 
            0 0 30px #00ffff,
            inset 0 0 30px rgba(0, 255, 255, 0.4);
        }

        .neon-button-secondary {
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 136, 255, 0.1) 100%);
          border: 2px solid rgba(0, 255, 255, 0.5);
          padding: 14px 24px;
          font-family: 'Orbitron', monospace;
          font-size: 1rem;
          font-weight: 700;
          color: #00ffff;
          border-radius: 12px;
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

        @keyframes timer-pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes tap-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 0 40px #00ffff,
              inset 0 0 40px rgba(0, 255, 255, 0.3);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 
              0 0 60px #00ffff,
              inset 0 0 60px rgba(0, 255, 255, 0.4);
          }
        }

        @keyframes hit-flash {
          0% { 
            opacity: 1;
            transform: scale(0.8);
          }
          100% { 
            opacity: 0;
            transform: scale(1.5);
          }
        }

        @keyframes particle-burst {
          0% { 
            opacity: 1;
            transform: scale(1);
          }
          100% { 
            opacity: 0;
            transform: scale(2);
          }
        }

        @keyframes win-glow {
          0%, 100% { 
            box-shadow: 
              0 0 40px #00ff00,
              inset 0 0 40px rgba(0, 255, 0, 0.2);
          }
          50% { 
            box-shadow: 
              0 0 60px #00ff00,
              inset 0 0 60px rgba(0, 255, 0, 0.3);
          }
        }

        @keyframes lose-glow {
          0%, 100% { 
            box-shadow: 
              0 0 40px #ff0000,
              inset 0 0 40px rgba(255, 0, 0, 0.2);
          }
          50% { 
            box-shadow: 
              0 0 60px #ff0000,
              inset 0 0 60px rgba(255, 0, 0, 0.3);
          }
        }

        @media (max-width: 768px) {
          .tap-area {
            width: 200px;
            height: 200px;
          }
          
          .tap-counter {
            font-size: 4rem;
          }
          
          .result-banner {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
