import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface RewardStatus {
  can_claim: boolean;
  reward_amount: number;
  streak: number;
  last_claimed: string | null;
  total_claims: number;
  hours_until_next_claim: number;
}

interface ClaimResult {
  success: boolean;
  reward_amount: number;
  streak: number;
  streak_reset: boolean;
  message: string;
}

export function useRewards(userId?: string) {
  const [rewardStatus, setRewardStatus] = useState<RewardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchRewardStatus();
  }, [userId]);

  const fetchRewardStatus = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.rpc('get_reward_status', {
        user_id: userId
      });

      if (error) {
        console.error('Error fetching reward status:', error);
        return;
      }

      if (data && data.length > 0) {
        const status = data[0] as RewardStatus;
        setRewardStatus(status);
      }
    } catch (error) {
      console.error('Error in fetchRewardStatus:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (): Promise<ClaimResult | null> => {
    if (!userId || claiming) return null;

    setClaiming(true);
    try {
      const { data, error } = await supabase.rpc('claim_daily_reward', {
        user_id: userId
      });

      if (error) {
        console.error('Error claiming reward:', error);
        setClaiming(false);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as ClaimResult;
        
        // Refresh reward status
        await fetchRewardStatus();
        
        setClaiming(false);
        return result;
      }

      setClaiming(false);
      return null;
    } catch (error) {
      console.error('Error in claimReward:', error);
      setClaiming(false);
      return null;
    }
  };

  const refresh = () => {
    fetchRewardStatus();
  };

  return {
    rewardStatus,
    loading,
    claiming,
    claimReward,
    refresh,
    fetchRewardStatus
  };
}
