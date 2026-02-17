import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Payout {
  id: string;
  ton_address: string;
  amount_ton: number;
  status: 'pending' | 'approved' | 'sent' | 'failed';
  tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

interface PayoutRequestResult {
  success: boolean;
  payout_id: string | null;
  message: string;
}

export function usePayouts(userId?: string) {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchPayoutHistory();
  }, [userId]);

  const fetchPayoutHistory = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.rpc('get_payout_history', {
        user_id: userId
      });

      if (error) {
        console.error('Error fetching payout history:', error);
        return;
      }

      if (data) {
        const payoutsList = data as Payout[];
        setPayouts(payoutsList);
      }
    } catch (error) {
      console.error('Error in fetchPayoutHistory:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async (amountTon: number, tonAddress: string): Promise<PayoutRequestResult | null> => {
    if (!userId || requesting || amountTon <= 0 || !tonAddress) return null;

    setRequesting(true);
    try {
      const { data, error } = await supabase.rpc('request_payout', {
        user_id: userId,
        ton_address: tonAddress,
        amount_ton: amountTon
      });

      if (error) {
        console.error('Error requesting payout:', error);
        setRequesting(false);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as PayoutRequestResult;
        
        // Refresh payout history
        await fetchPayoutHistory();
        
        setRequesting(false);
        return result;
      }

      setRequesting(false);
      return null;
    } catch (error) {
      console.error('Error in requestPayout:', error);
      setRequesting(false);
      return null;
    }
  };

  const formatStatus = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'sent':
        return 'Sent';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400';
      case 'approved':
        return 'text-blue-400';
      case 'sent':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-400/20 border-yellow-400/50';
      case 'approved':
        return 'bg-blue-400/20 border-blue-400/50';
      case 'sent':
        return 'bg-green-400/20 border-green-400/50';
      case 'failed':
        return 'bg-red-400/20 border-red-400/50';
      default:
        return 'bg-gray-400/20 border-gray-400/50';
    }
  };

  const shortenTxHash = (hash: string | null): string => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const refresh = () => {
    fetchPayoutHistory();
  };

  return {
    payouts,
    loading,
    requesting,
    requestPayout,
    fetchPayoutHistory,
    formatStatus,
    getStatusColor,
    getStatusBgColor,
    shortenTxHash,
    formatDate,
    refresh
  };
}
