import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile, CosmeticWithStatus, TitleWithStatus, getCosmeticDisplayName, getTitleDisplayName } from '@/data/cosmetics';

interface GrantResult {
  success: boolean;
  message: string;
}

interface EquipResult {
  success: boolean;
  message: string;
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userCosmetics, setUserCosmetics] = useState<CosmeticWithStatus[]>([]);
  const [userTitles, setUserTitles] = useState<TitleWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // Get user profile
      const { data: profileData, error: profileError } = await supabase.rpc('get_user_profile', {
        user_id: userId
      });

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      } else if (profileData && profileData.length > 0) {
        const profileRecord = profileData[0];
        setProfile({
          username: profileRecord.username,
          equipped_aura: profileRecord.equipped_aura,
          equipped_frame: profileRecord.equipped_frame,
          equipped_emoji: profileRecord.equipped_emoji,
          equipped_title: profileRecord.equipped_title,
          owned_cosmetics: profileRecord.owned_cosmetics || [],
          owned_titles: profileRecord.owned_titles || []
        });
      }

      // Get all cosmetics with ownership status
      const { data: cosmeticsData, error: cosmeticsError } = await supabase.rpc('get_user_cosmetics', {
        user_id: userId
      });

      if (cosmeticsError) {
        console.error('Error fetching user cosmetics:', cosmeticsError);
      } else {
        setUserCosmetics(cosmeticsData || []);
      }

      // Get user titles
      const { data: titlesData, error: titlesError } = await supabase.rpc('get_user_titles', {
        user_id: userId
      });

      if (titlesError) {
        console.error('Error fetching user titles:', titlesError);
      } else {
        setUserTitles(titlesData || []);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const grantCosmetic = async (cosmeticKey: string): Promise<GrantResult | null> => {
    if (!userId || updating) return null;

    try {
      setUpdating(true);
      
      const { data, error } = await supabase.rpc('grant_cosmetic', {
        user_id: userId,
        cosmetic_key: cosmeticKey
      });

      if (error) {
        console.error('Error granting cosmetic:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as GrantResult;
        
        // Refresh profile
        await fetchProfile();
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in grantCosmetic:', error);
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const equipCosmetic = async (cosmeticKey: string): Promise<EquipResult | null> => {
    if (!userId || updating) return null;

    try {
      setUpdating(true);
      
      const { data, error } = await supabase.rpc('equip_cosmetic', {
        user_id: userId,
        cosmetic_key: cosmeticKey
      });

      if (error) {
        console.error('Error equipping cosmetic:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as EquipResult;
        
        // Refresh profile
        await fetchProfile();
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in equipCosmetic:', error);
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const grantTitle = async (titleKey: string): Promise<GrantResult | null> => {
    if (!userId || updating) return null;

    try {
      setUpdating(true);
      
      const { data, error } = await supabase.rpc('grant_title', {
        user_id: userId,
        title_key: titleKey
      });

      if (error) {
        console.error('Error granting title:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as GrantResult;
        
        // Refresh profile
        await fetchProfile();
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in grantTitle:', error);
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const equipTitle = async (titleKey: string): Promise<EquipResult | null> => {
    if (!userId || updating) return null;

    try {
      setUpdating(true);
      
      const { data, error } = await supabase.rpc('equip_title', {
        user_id: userId,
        title_key: titleKey
      });

      if (error) {
        console.error('Error equipping title:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as EquipResult;
        
        // Refresh profile
        await fetchProfile();
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in equipTitle:', error);
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const getEquippedAura = (): CosmeticWithStatus | undefined => {
    return userCosmetics.find(c => c.type === 'aura' && c.equipped);
  };

  const getEquippedFrame = (): CosmeticWithStatus | undefined => {
    return userCosmetics.find(c => c.type === 'frame' && c.equipped);
  };

  const getEquippedEmoji = (): CosmeticWithStatus | undefined => {
    return userCosmetics.find(c => c.type === 'emoji' && c.equipped);
  };

  const getEquippedTitle = (): TitleWithStatus | undefined => {
    return userTitles.find(t => t.equipped);
  };

  const getOwnedCosmeticsByType = (type: 'aura' | 'frame' | 'emoji') => {
    return userCosmetics.filter(c => c.type === type && c.owned);
  };

  const getUnownedCosmeticsByType = (type: 'aura' | 'frame' | 'emoji') => {
    return userCosmetics.filter(c => c.type === type && !c.owned);
  };

  const getOwnedTitles = () => {
    return userTitles.filter(t => t.owned);
  };

  const getUnownedTitles = () => {
    return userTitles.filter(t => !t.owned);
  };

  const getProfileDisplay = () => {
    if (!profile) return null;

    const equippedAura = getEquippedAura();
    const equippedFrame = getEquippedFrame();
    const equippedEmoji = getEquippedEmoji();
    const equippedTitle = getEquippedTitle();

    return {
      username: profile.username,
      aura: equippedAura ? getCosmeticDisplayName(equippedAura.cosmetic_key) : null,
      frame: equippedFrame ? getCosmeticDisplayName(equippedFrame.cosmetic_key) : null,
      emoji: equippedEmoji ? getCosmeticDisplayName(equippedEmoji.cosmetic_key) : null,
      title: equippedTitle ? getTitleDisplayName(equippedTitle.title_key) : null
    };
  };

  const hasCosmetics = (): boolean => {
    return userCosmetics.some(c => c.owned);
  };

  const hasTitles = (): boolean => {
    return userTitles.some(t => t.owned);
  };

  const getTotalOwnedCosmetics = (): number => {
    return userCosmetics.filter(c => c.owned).length;
  };

  const getTotalOwnedTitles = (): number => {
    return userTitles.filter(t => t.owned).length;
  };

  const refresh = () => {
    fetchProfile();
  };

  return {
    profile,
    userCosmetics,
    userTitles,
    loading,
    updating,
    fetchProfile,
    grantCosmetic,
    equipCosmetic,
    grantTitle,
    equipTitle,
    getEquippedAura,
    getEquippedFrame,
    getEquippedEmoji,
    getEquippedTitle,
    getOwnedCosmeticsByType,
    getUnownedCosmeticsByType,
    getOwnedTitles,
    getUnownedTitles,
    getProfileDisplay,
    hasCosmetics,
    hasTitles,
    getTotalOwnedCosmetics,
    getTotalOwnedTitles,
    refresh
  };
}
