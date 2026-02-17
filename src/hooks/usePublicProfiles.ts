import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PublicProfile, MyPublicProfile, ProfileSearchResult, UpdateProfilePayload } from '@/data/publicProfiles';

interface UpdateResult {
  success: boolean;
  message: string;
}

export function usePublicProfiles(userId?: string) {
  const [myPublicProfile, setMyPublicProfile] = useState<MyPublicProfile | null>(null);
  const [viewedProfile, setViewedProfile] = useState<PublicProfile | null>(null);
  const [searchResults, setSearchResults] = useState<ProfileSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchMyPublicProfile();
  }, [userId]);

  const fetchMyPublicProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase.rpc('get_my_public_profile', {
        p_user_id: userId
      });

      if (fetchError) {
        console.error('Error fetching my public profile:', fetchError);
        setError('Failed to fetch profile');
      } else if (data && data.length > 0) {
        setMyPublicProfile(data[0]);
      }
    } catch (error) {
      console.error('Error in fetchMyPublicProfile:', error);
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateMyPublicProfile = async (payload: UpdateProfilePayload): Promise<UpdateResult | null> => {
    if (!userId || updating) return null;

    try {
      setUpdating(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('update_public_profile', {
        p_user_id: userId,
        p_username: payload.username,
        p_bio: payload.bio,
        p_country_code: payload.country_code,
        p_avatar_emoji: payload.avatar_emoji,
        p_is_public: payload.is_public
      });

      if (error) {
        console.error('Error updating public profile:', error);
        setError(error.message);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as UpdateResult;
        
        if (result.success) {
          // Refresh my public profile
          await fetchMyPublicProfile();
        }
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in updateMyPublicProfile:', error);
      setError('An error occurred');
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const getProfileById = async (profileUserId: string): Promise<PublicProfile | null> => {
    try {
      setError(null);
      
      const { data, error } = await supabase.rpc('get_public_profile_by_id', {
        p_user_id: profileUserId
      });

      if (error) {
        console.error('Error fetching profile by ID:', error);
        setError('Failed to fetch profile');
        return null;
      }

      if (data && data.length > 0) {
        const profile = data[0] as PublicProfile;
        setViewedProfile(profile);
        return profile;
      }

      return null;
    } catch (error) {
      console.error('Error in getProfileById:', error);
      setError('An error occurred');
      return null;
    }
  };

  const getProfileByUsername = async (username: string): Promise<PublicProfile | null> => {
    try {
      setError(null);
      
      const { data, error } = await supabase.rpc('get_public_profile_by_username', {
        p_username: username
      });

      if (error) {
        console.error('Error fetching profile by username:', error);
        setError('Failed to fetch profile');
        return null;
      }

      if (data && data.length > 0) {
        const profile = data[0] as PublicProfile;
        setViewedProfile(profile);
        return profile;
      }

      return null;
    } catch (error) {
      console.error('Error in getProfileByUsername:', error);
      setError('An error occurred');
      return null;
    }
  };

  const searchProfiles = async (query: string, limit: number = 10): Promise<ProfileSearchResult[]> => {
    try {
      setError(null);
      
      const { data, error } = await supabase.rpc('search_public_profiles', {
        p_query: query,
        p_limit: limit
      });

      if (error) {
        console.error('Error searching profiles:', error);
        setError('Failed to search profiles');
        return [];
      }

      const results = (data || []) as ProfileSearchResult[];
      setSearchResults(results);
      return results;
    } catch (error) {
      console.error('Error in searchProfiles:', error);
      setError('An error occurred');
      return [];
    }
  };

  const clearViewedProfile = () => {
    setViewedProfile(null);
  };

  const clearSearchResults = () => {
    setSearchResults([]);
  };

  const clearError = () => {
    setError(null);
  };

  const refresh = () => {
    fetchMyPublicProfile();
  };

  return {
    myPublicProfile,
    viewedProfile,
    searchResults,
    loading,
    updating,
    error,
    fetchMyPublicProfile,
    updateMyPublicProfile,
    getProfileById,
    getProfileByUsername,
    searchProfiles,
    clearViewedProfile,
    clearSearchResults,
    clearError,
    refresh
  };
}
