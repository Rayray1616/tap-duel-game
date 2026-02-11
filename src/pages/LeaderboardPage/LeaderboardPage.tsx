import { useState, useEffect } from 'react';
import { Button, Cell, Section, Title } from '@telegram-apps/telegram-ui';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

export function LeaderboardPage() {
  const [topPlayers, setTopPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('score', { ascending: false })
        .limit(20);

      setTopPlayers(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-4">
      <div className="max-w-md mx-auto">
        <Title className="text-center mb-6 text-cyan-400 font-bold">
          🏆 LEADERBOARD 🏆
        </Title>

        <Section className="mb-4">
          {topPlayers.map((player, index) => (
            <Cell key={player.id}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">
                    {getRankEmoji(index + 1)}
                  </span>
                  <div>
                    <div className="font-semibold">{player.username}</div>
                    <div className="text-sm text-cyan-300">Level {player.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-cyan-300">{player.score}</div>
                  <div className="text-xs text-cyan-500">points</div>
                </div>
              </div>
            </Cell>
          ))}
        </Section>

        <div className="mt-6">
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gray-600 hover:bg-gray-500 text-white w-full"
          >
            🏠 HOME
          </Button>
        </div>
      </div>
    </div>
  );
}
