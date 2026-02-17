import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useTelegram } from '@/telegram/useTelegram';
import { usePlayerProgression } from '@/hooks/usePlayerProgression';
import { useRewards } from '@/hooks/useRewards';
import { useTonWallet } from '@/hooks/useTonWallet';
import { useGems } from '@/hooks/useGems';
import { useTonTopUp } from '@/hooks/useTonTopUp';
import { usePayouts } from '@/hooks/usePayouts';
import { useReferral } from '@/hooks/useReferral';
import type { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

export function HomeScreen() {
  const { user: telegramUser } = useTelegram();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [energy, setEnergy] = useState(100);
  
  // XP and progression
  const { progression, loading: progressionLoading } = usePlayerProgression(telegramUser?.id?.toString());
  
  // Daily rewards
  const { rewardStatus, loading: rewardsLoading } = useRewards(telegramUser?.id?.toString());
  
  // TON wallet
  const { walletInfo, balance, loading: walletLoading } = useTonWallet(telegramUser?.id?.toString());
  
  // Gems
  const { gemsInfo, loading: gemsLoading } = useGems(telegramUser?.id?.toString());
  
  // TON Top-up
  const { isPending, hasDeposit } = useTonTopUp(telegramUser?.id?.toString());
  
  // Payouts
  const { payouts } = usePayouts(telegramUser?.id?.toString());
  
  // Referrals
  const { myCode, referrals } = useReferral(telegramUser?.id?.toString());

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
      <div className="min-h-screen bg-black flex items-center justify-center"
           style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
        <div className="text-cyan-400 text-2xl font-bold animate-pulse">LOADING...</div>
      </div>
    );
  }

  const maxEnergy = 100 + (user?.energy_boost || 0);
  const energyPercentage = (energy / maxEnergy) * 100;

  return (
    <div className="min-h-screen bg-black text-cyan-400 flex flex-col relative overflow-hidden"
         style={{ minHeight: '100vh', width: '100%', overflow: 'hidden', paddingBottom: 'env(safe-area-inset-bottom)' }}>
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
              <div className="text-lg font-bold">{progression?.level || user?.level || 1}</div>
            </div>
            <div className="text-cyan-400 text-right">
              <div className="text-xs text-cyan-600 uppercase tracking-wider">Score</div>
              <div className="text-lg font-bold">{user?.score || 0}</div>
            </div>
          </div>

          {/* Daily Reward Badge */}
          {!rewardsLoading && rewardStatus?.can_claim && (
            <div className="mb-4">
              <button
                onClick={() => navigate('/rewards')}
                className="w-full neon-reward-badge"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">🎁</span>
                  <span className="text-sm font-bold">Daily Reward Available!</span>
                  <span className="text-2xl animate-pulse">✨</span>
                </div>
              </button>
            </div>
          )}

          {/* Streak Indicator */}
          {!rewardsLoading && rewardStatus && rewardStatus.streak > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-orange-600 uppercase tracking-wider">Daily Streak</span>
                <span className="text-xs text-orange-400">{rewardStatus.streak} days 🔥</span>
              </div>
              <div className="relative h-2 bg-gray-900 rounded-full overflow-hidden mt-1">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min((rewardStatus.streak % 10) * 10, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* TON Wallet Status */}
          {!walletLoading && (
            <div className="mb-4">
              {walletInfo?.connected ? (
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 text-lg">💎</span>
                    <span className="text-xs text-blue-600 uppercase tracking-wider">TON Balance</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-400">
                      {balance !== null ? balance.toFixed(4) : '0.0000'} TON
                    </div>
                    <div className="text-xs text-blue-600">
                      {walletInfo.ton_address ? `${walletInfo.ton_address.slice(0, 6)}...${walletInfo.ton_address.slice(-4)}` : ''}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/wallet')}
                  className="w-full neon-wallet-badge"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">💎</span>
                    <span className="text-sm font-bold">Connect TON Wallet</span>
                    <span className="text-lg animate-pulse">✨</span>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Gems Balance */}
          {!gemsLoading && (
            <div className="mb-4">
              <button
                onClick={() => navigate('/shop')}
                className="w-full neon-gems-badge"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 text-lg">💎</span>
                    <span className="text-xs text-green-600 uppercase tracking-wider">Gems</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-400">
                      {gemsInfo?.gems?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-green-600">Tap to Shop</div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* TON Deposit Status */}
          {isPending && (
            <div className="mb-4">
              <button
                onClick={() => navigate('/topup')}
                className="w-full neon-ton-deposit-badge"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-blue-400 text-lg">⏳</span>
                  <span className="text-sm font-bold text-blue-400">TON DEPOSIT PENDING</span>
                  <span className="text-lg animate-pulse">💎</span>
                </div>
              </button>
            </div>
          )}

          {/* Withdraw Button */}
          {gemsInfo && gemsInfo.gems >= 100 && (
            <div className="mb-4">
              <button
                onClick={() => navigate('/payouts')}
                className="w-full neon-withdraw-button"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-purple-400 text-lg">💸</span>
                  <span className="text-sm font-bold text-purple-400">WITHDRAW</span>
                  <span className="text-xs text-purple-600">
                    ({(gemsInfo.gems / 100).toFixed(2)} TON)
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Invite & Earn Button */}
          <div className="mb-4">
            <button
              onClick={() => navigate('/referrals')}
              className="w-full neon-referral-button"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-green-400 text-lg">🎉</span>
                <span className="text-sm font-bold text-green-400">INVITE & EARN</span>
                <span className="text-xs text-green-600">
                  +50 💎 per friend
                </span>
              </div>
            </button>
          </div>

          {/* XP Bar */}
          {!progressionLoading && progression && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-600 uppercase tracking-wider">XP</span>
                <span className="text-xs text-purple-400">{progression.xp} XP</span>
              </div>
              <div className="relative h-4 bg-gray-900 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progression.xp_progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-lg">
                    {progression.xp_to_next_level} to Level {progression.level + 1}
                  </span>
                </div>
              </div>
            </div>
          )}

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

        .neon-reward-badge {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%);
          border: 2px solid rgba(255, 215, 0, 0.6);
          border-radius: 12px;
          padding: 12px 16px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #ffd700;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          animation: reward-pulse 2s ease-in-out infinite;
        }

        .neon-reward-badge:hover {
          transform: scale(1.05);
          border-color: rgba(255, 215, 0, 0.8);
          box-shadow: 
            0 0 30px rgba(255, 215, 0, 0.6),
            inset 0 0 30px rgba(255, 215, 0, 0.2);
        }

        .neon-wallet-badge {
          background: linear-gradient(135deg, rgba(0, 136, 255, 0.2) 0%, rgba(128, 0, 255, 0.2) 100%);
          border: 2px solid rgba(0, 136, 255, 0.6);
          border-radius: 12px;
          padding: 12px 16px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #0088ff;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          animation: wallet-pulse 2s ease-in-out infinite;
        }

        .neon-wallet-badge:hover {
          transform: scale(1.05);
          border-color: rgba(0, 136, 255, 0.8);
          box-shadow: 
            0 0 30px rgba(0, 136, 255, 0.6),
            inset 0 0 30px rgba(0, 136, 255, 0.2);
        }

        @keyframes reward-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 0 20px rgba(255, 215, 0, 0.4),
              inset 0 0 20px rgba(255, 215, 0, 0.1);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 
              0 0 30px rgba(255, 215, 0, 0.6),
              inset 0 0 30px rgba(255, 215, 0, 0.2);
          }
        }

        @keyframes wallet-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 0 20px rgba(0, 136, 255, 0.4),
              inset 0 0 20px rgba(0, 136, 255, 0.1);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 
              0 0 30px rgba(0, 136, 255, 0.6),
              inset 0 0 30px rgba(0, 136, 255, 0.2);
          }
        }

        .neon-gems-badge {
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 255, 0, 0.1) 100%);
          border: 2px solid rgba(0, 255, 0, 0.6);
          border-radius: 12px;
          padding: 12px 16px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #00ff00;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          animation: gems-pulse 2s ease-in-out infinite;
        }

        .neon-gems-badge:hover {
          transform: scale(1.05);
          border-color: rgba(0, 255, 0, 0.8);
          box-shadow: 
            0 0 30px rgba(0, 255, 0, 0.6),
            inset 0 0 30px rgba(0, 255, 0, 0.2);
        }

        @keyframes gems-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 0 20px rgba(0, 255, 0, 0.4),
              inset 0 0 20px rgba(0, 255, 0, 0.1);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 
              0 0 30px rgba(0, 255, 0, 0.6),
              inset 0 0 30px rgba(0, 255, 0, 0.2);
          }
        }

        .neon-ton-deposit-badge {
          background: linear-gradient(135deg, rgba(0, 136, 255, 0.2) 0%, rgba(128, 0, 255, 0.1) 100%);
          border: 2px solid rgba(0, 136, 255, 0.6);
          border-radius: 12px;
          padding: 12px 16px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #0088ff;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          animation: ton-deposit-pulse 2s ease-in-out infinite;
        }

        .neon-ton-deposit-badge:hover {
          transform: scale(1.05);
          border-color: rgba(0, 136, 255, 0.8);
          box-shadow: 
            0 0 30px rgba(0, 136, 255, 0.6),
            inset 0 0 30px rgba(0, 136, 255, 0.2);
        }

        @keyframes ton-deposit-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 0 20px rgba(0, 136, 255, 0.4),
              inset 0 0 20px rgba(0, 136, 255, 0.1);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 
              0 0 30px rgba(0, 136, 255, 0.6),
              inset 0 0 30px rgba(0, 136, 255, 0.2);
          }
        }

        .neon-withdraw-button {
          background: linear-gradient(135deg, rgba(128, 0, 255, 0.2) 0%, rgba(255, 0, 128, 0.1) 100%);
          border: 2px solid rgba(128, 0, 255, 0.6);
          border-radius: 12px;
          padding: 12px 16px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #8000ff;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          animation: withdraw-pulse 2s ease-in-out infinite;
        }

        .neon-withdraw-button:hover {
          transform: scale(1.05);
          border-color: rgba(128, 0, 255, 0.8);
          box-shadow: 
            0 0 30px rgba(128, 0, 255, 0.6),
            inset 0 0 30px rgba(128, 0, 255, 0.2);
        }

        @keyframes withdraw-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 0 20px rgba(128, 0, 255, 0.4),
              inset 0 0 20px rgba(128, 0, 255, 0.1);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 
              0 0 30px rgba(128, 0, 255, 0.6),
              inset 0 0 30px rgba(128, 0, 255, 0.2);
          }
        }

        .neon-referral-button {
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 136, 255, 0.1) 100%);
          border: 2px solid rgba(0, 255, 0, 0.6);
          border-radius: 12px;
          padding: 12px 16px;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #00ff00;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          animation: referral-pulse 2s ease-in-out infinite;
        }

        .neon-referral-button:hover {
          transform: scale(1.05);
          border-color: rgba(0, 255, 0, 0.8);
          box-shadow: 
            0 0 30px rgba(0, 255, 0, 0.6),
            inset 0 0 30px rgba(0, 255, 0, 0.2);
        }

        @keyframes referral-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 0 20px rgba(0, 255, 0, 0.4),
              inset 0 0 20px rgba(0, 255, 0, 0.1);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 
              0 0 30px rgba(0, 255, 0, 0.6),
              inset 0 0 30px rgba(0, 255, 0, 0.2);
          }
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
