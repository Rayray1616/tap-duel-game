import { useState, useEffect } from 'react';
import { Button, Cell, Section, Title } from '@telegram-apps/telegram-ui';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

export function RewardsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingDaily, setClaimingDaily] = useState(false);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      // Get current user from localStorage or session
      const telegramId = localStorage.getItem('telegram_id');
      if (!telegramId) return;

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

  const claimDailyReward = async () => {
    if (!user || user.daily_reward_claimed) return;

    setClaimingDaily(true);

    try {
      const baseReward = 50;
      const levelBonus = user.level * 10;
      const totalReward = baseReward + levelBonus;

      const { data: updatedUser } = await supabase
        .from('users')
        .update({
          score: user.score + totalReward,
          daily_reward_claimed: true,
          energy: Math.min(user.energy + 30, 100),
        })
        .eq('id', user.id)
        .select()
        .single();

      setUser(updatedUser);
      alert(`🎉 Daily reward claimed! +${totalReward} points and +30 energy!`);
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      alert('Error claiming reward. Please try again.');
    } finally {
      setClaimingDaily(false);
    }
  };

  const canClaimDaily = () => {
    if (!user) return false;
    
    const today = new Date();
    const lastClaimDate = new Date(user.updated_at);
    
    // Check if last claim was on a different day
    return (
      today.getDate() !== lastClaimDate.getDate() ||
      today.getMonth() !== lastClaimDate.getMonth() ||
      today.getFullYear() !== lastClaimDate.getFullYear()
    ) || !user.daily_reward_claimed;
  };

  const getNextClaimTime = () => {
    if (!user) return '';
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return tomorrow.toLocaleString();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-4">
      <div className="max-w-md mx-auto">
        <Title className="text-center mb-6 text-cyan-400 font-bold">
          🎁 DAILY REWARDS 🎁
        </Title>

        <Section className="mb-4">
          <Cell>
            <div className="flex justify-between items-center">
              <span>Player: {user?.username}</span>
              <span>Level: {user?.level}</span>
            </div>
          </Cell>
          <Cell>
            <div className="flex justify-between items-center">
              <span>Current Score: {user?.score}</span>
              <span>Energy: {user?.energy}/100</span>
            </div>
          </Cell>
        </Section>

        <Section className="mb-4">
          <Cell>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2 text-cyan-300">Daily Reward</h3>
              <div className="mb-4">
                <div className="text-lg">Base Reward: 50 points</div>
                <div className="text-lg">Level Bonus: +{user?.level || 0}0 points</div>
                <div className="text-lg font-bold text-cyan-300">
                  Total: {50 + ((user?.level || 0) * 10)} points
                </div>
                <div className="text-sm text-cyan-500 mt-2">+30 Energy Bonus</div>
              </div>
              
              {canClaimDaily() ? (
                <Button
                  onClick={claimDailyReward}
                  disabled={claimingDaily}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-green-500/50 transition-all duration-200 transform hover:scale-105"
                >
                  {claimingDaily ? 'CLAIMING...' : 'CLAIM DAILY REWARD'}
                </Button>
              ) : (
                <div className="text-center">
                  <div className="text-cyan-300 mb-2">✅ Already claimed today!</div>
                  <div className="text-sm text-cyan-500">
                    Next claim: {getNextClaimTime()}
                  </div>
                </div>
              )}
            </div>
          </Cell>
        </Section>

        <Section className="mb-4">
          <Cell>
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2 text-cyan-300">Level Progress</h3>
              <div className="mb-2">
                <div className="text-sm">Level {user?.level || 1}</div>
                <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
                  <div 
                    className="bg-cyan-400 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${((user?.score || 0) % 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-cyan-500 mt-1">
                  {(user?.score || 0) % 100}/100 to next level
                </div>
              </div>
            </div>
          </Cell>
        </Section>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button
            onClick={() => window.location.href = '/shop'}
            className="bg-purple-600 hover:bg-purple-500 text-white"
          >
            🛒 UPGRADES
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gray-600 hover:bg-gray-500 text-white"
          >
            🏠 HOME
          </Button>
        </div>
      </div>
    </div>
  );
}
