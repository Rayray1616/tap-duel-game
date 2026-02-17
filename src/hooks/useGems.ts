import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface GemsInfo {
  gems: number;
  updated_at: string | null;
}

interface GemsResult {
  success: boolean;
  new_total: number;
  message: string;
}

export function useGems(userId?: string) {
  const [gemsInfo, setGemsInfo] = useState<GemsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchGems();
  }, [userId]);

  const fetchGems = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.rpc('get_gems', {
        user_id: userId
      });

      if (error) {
        console.error('Error fetching gems:', error);
        return;
      }

      if (data && data.length > 0) {
        const info = data[0] as GemsInfo;
        setGemsInfo(info);
      } else {
        // Initialize with 0 gems if no record exists
        setGemsInfo({ gems: 0, updated_at: null });
      }
    } catch (error) {
      console.error('Error in fetchGems:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGems = async (amount: number): Promise<GemsResult | null> => {
    if (!userId || processing || amount <= 0) return null;

    setProcessing(true);
    try {
      const { data, error } = await supabase.rpc('add_gems', {
        user_id: userId,
        amount: amount
      });

      if (error) {
        console.error('Error adding gems:', error);
        setProcessing(false);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as GemsResult;
        
        // Refresh gems info
        await fetchGems();
        
        setProcessing(false);
        return result;
      }

      setProcessing(false);
      return null;
    } catch (error) {
      console.error('Error in addGems:', error);
      setProcessing(false);
      return null;
    }
  };

  const spendGems = async (amount: number): Promise<GemsResult | null> => {
    if (!userId || processing || amount <= 0) return null;

    setProcessing(true);
    try {
      const { data, error } = await supabase.rpc('spend_gems', {
        user_id: userId,
        amount: amount
      });

      if (error) {
        console.error('Error spending gems:', error);
        setProcessing(false);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as GemsResult;
        
        // Refresh gems info
        await fetchGems();
        
        setProcessing(false);
        return result;
      }

      setProcessing(false);
      return null;
    } catch (error) {
      console.error('Error in spendGems:', error);
      setProcessing(false);
      return null;
    }
  };

  const refresh = () => {
    fetchGems();
  };

  return {
    gemsInfo,
    loading,
    processing,
    addGems,
    spendGems,
    refresh,
    fetchGems
  };
}
