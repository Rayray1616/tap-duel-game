import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  win_ratio: number;
  updated_at: string;
}

interface LeaderboardResult {
  success: boolean;
  message: string;
}

export function useLeaderboard(currentUserId?: string) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'all_time'>('all_time');

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  const fetchLeaderboard = async (timeframe: 'daily' | 'weekly' | 'all_time' = 'all_time') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_leaderboard', {
        timeframe: timeframe
      });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      if (data) {
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error in fetchLeaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeaderboard = async (result: 'win' | 'lose'): Promise<LeaderboardResult | null> => {
    if (!currentUserId) return null;

    try {
      const { data, error } = await supabase.rpc('update_leaderboard', {
        user_id: currentUserId,
        duel_result: result
      });

      if (error) {
        console.error('Error updating leaderboard:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as LeaderboardResult;
        
        // Refresh leaderboard data
        fetchLeaderboard(activeTab);
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in updateLeaderboard:', error);
      return null;
    }
  };

  const refresh = () => {
    fetchLeaderboard(activeTab);
  };

  const changeTab = (tab: 'daily' | 'weekly' | 'all_time') => {
    setActiveTab(tab);
  };

  return {
    leaderboard,
    loading,
    activeTab,
    updateLeaderboard,
    refresh,
    changeTab,
    fetchLeaderboard
  };
}
