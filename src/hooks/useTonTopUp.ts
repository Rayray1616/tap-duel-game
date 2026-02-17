import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DepositStatus {
  status: string;
  deposit_address: string | null;
  amount_ton: number;
  gems_credited: number;
  tx_hash: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface DepositResult {
  success: boolean;
  status: string;
  amount_ton: number;
  gems_credited: number;
  tx_hash: string | null;
  message: string;
}

interface CreateAddressResult {
  success: boolean;
  deposit_address: string | null;
  message: string;
}

export function useTonTopUp(userId?: string) {
  const [depositStatus, setDepositStatus] = useState<DepositStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchDepositStatus();
  }, [userId]);

  const fetchDepositStatus = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.rpc('get_deposit_status', {
        user_id: userId
      });

      if (error) {
        console.error('Error fetching deposit status:', error);
        return;
      }

      if (data && data.length > 0) {
        const status = data[0] as DepositStatus;
        setDepositStatus(status);
      } else {
        setDepositStatus(null);
      }
    } catch (error) {
      console.error('Error in fetchDepositStatus:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDepositAddress = async (): Promise<CreateAddressResult | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase.rpc('create_deposit_address', {
        user_id: userId
      });

      if (error) {
        console.error('Error creating deposit address:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as CreateAddressResult;
        
        // Refresh deposit status
        await fetchDepositStatus();
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in getDepositAddress:', error);
      return null;
    }
  };

  const refreshDepositStatus = async (): Promise<DepositResult | null> => {
    if (!userId || refreshing) return null;

    setRefreshing(true);
    try {
      const { data, error } = await supabase.rpc('verify_deposit', {
        user_id: userId
      });

      if (error) {
        console.error('Error verifying deposit:', error);
        setRefreshing(false);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as DepositResult;
        
        // Refresh deposit status
        await fetchDepositStatus();
        
        setRefreshing(false);
        return result;
      }

      setRefreshing(false);
      return null;
    } catch (error) {
      console.error('Error in refreshDepositStatus:', error);
      setRefreshing(false);
      return null;
    }
  };

  const isPending = depositStatus?.status === 'pending';
  const isConfirmed = depositStatus?.status === 'confirmed';
  const hasDeposit = depositStatus !== null;

  const refresh = () => {
    fetchDepositStatus();
  };

  return {
    depositStatus,
    loading,
    refreshing,
    getDepositAddress,
    refreshDepositStatus,
    isPending,
    isConfirmed,
    hasDeposit,
    refresh,
    fetchDepositStatus
  };
}
