import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Referral {
  referred_username: string;
  referred_user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ReferralStatus {
  my_code: string | null;
  has_used_code: boolean;
  referrals: Referral[];
}

interface ReferralCodeResult {
  success: boolean;
  code: string | null;
  message: string;
}

interface RegisterReferralResult {
  success: boolean;
  referrer_user_id: string | null;
  message: string;
}

interface ConfirmReferralResult {
  success: boolean;
  referrer_gems: number;
  referred_gems: number;
  message: string;
}

export function useReferral(userId?: string) {
  const [myCode, setMyCode] = useState<string | null>(null);
  const [hasUsedCode, setHasUsedCode] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    getReferralStatus();
  }, [userId]);

  const getReferralStatus = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.rpc('get_referral_status', {
        user_id: userId
      });

      if (error) {
        console.error('Error fetching referral status:', error);
        return;
      }

      if (data && data.length > 0) {
        const statusData = data[0] as ReferralStatus;
        setMyCode(statusData.my_code);
        setHasUsedCode(statusData.has_used_code);
        setReferrals(statusData.referrals || []);
      }
    } catch (error) {
      console.error('Error in getReferralStatus:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMyReferralCode = async (): Promise<string | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase.rpc('get_or_create_referral_code', {
        user_id: userId
      });

      if (error) {
        console.error('Error getting referral code:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as ReferralCodeResult;
        if (result.success && result.code) {
          setMyCode(result.code);
          return result.code;
        }
      }

      return null;
    } catch (error) {
      console.error('Error in getMyReferralCode:', error);
      return null;
    }
  };

  const registerReferral = async (code: string): Promise<RegisterReferralResult | null> => {
    if (!userId || registering || !code) return null;

    setRegistering(true);
    try {
      const { data, error } = await supabase.rpc('register_referral', {
        referral_code: code,
        new_user_id: userId
      });

      if (error) {
        console.error('Error registering referral:', error);
        setRegistering(false);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as RegisterReferralResult;
        
        // Refresh referral status
        await getReferralStatus();
        
        setRegistering(false);
        return result;
      }

      setRegistering(false);
      return null;
    } catch (error) {
      console.error('Error in registerReferral:', error);
      setRegistering(false);
      return null;
    }
  };

  const confirmReferral = async (): Promise<ConfirmReferralResult | null> => {
    if (!userId || confirming) return null;

    setConfirming(true);
    try {
      const { data, error } = await supabase.rpc('confirm_referral', {
        new_user_id: userId
      });

      if (error) {
        console.error('Error confirming referral:', error);
        setConfirming(false);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as ConfirmReferralResult;
        
        // Refresh referral status
        await getReferralStatus();
        
        setConfirming(false);
        return result;
      }

      setConfirming(false);
      return null;
    } catch (error) {
      console.error('Error in confirmReferral:', error);
      setConfirming(false);
      return null;
    }
  };

  const formatStatus = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'rewarded':
        return 'Rewarded';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400';
      case 'confirmed':
        return 'text-blue-400';
      case 'rewarded':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-400/20 border-yellow-400/50';
      case 'confirmed':
        return 'bg-blue-400/20 border-blue-400/50';
      case 'rewarded':
        return 'bg-green-400/20 border-green-400/50';
      default:
        return 'bg-gray-400/20 border-gray-400/50';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  };

  const shareReferralCode = async (code: string): Promise<boolean> => {
    try {
      const shareText = `Join Tap Duel Game and get 25 free gems! Use my referral code: ${code}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Tap Duel Game - Referral',
          text: shareText,
          url: window.location.origin + '?ref=' + code
        });
        return true;
      } else {
        // Fallback: copy to clipboard
        await copyToClipboard(shareText);
        return true;
      }
    } catch (error) {
      console.error('Error sharing referral code:', error);
      return false;
    }
  };

  const refresh = () => {
    getReferralStatus();
  };

  return {
    myCode,
    hasUsedCode,
    referrals,
    loading,
    registering,
    confirming,
    getMyReferralCode,
    registerReferral,
    confirmReferral,
    formatStatus,
    getStatusColor,
    getStatusBgColor,
    formatDate,
    copyToClipboard,
    shareReferralCode,
    refresh
  };
}
