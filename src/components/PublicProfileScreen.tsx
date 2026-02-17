import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublicProfiles } from '@/hooks/usePublicProfiles';
import { useTelegram } from '@/telegram/useTelegram';
import { 
  getProfileStats, 
  getCountryFlag, 
  getCountryName, 
  getLevelColor, 
  getLevelBgColor,
  getSeasonTierColor,
  getSeasonTierBgColor,
  formatNumber,
  formatDate,
  getCosmeticDisplayName,
  getTitleDisplayName
} from '@/data/publicProfiles';

export function PublicProfileScreen() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useTelegram();
  const { 
    viewedProfile, 
    loading, 
    error, 
    getProfileById,
    getProfileByUsername 
  } = usePublicProfiles();

  const [isNotFound, setIsNotFound] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsNotFound(true);
      return;
    }

    // Try to get profile by ID first, then by username
    const fetchProfile = async () => {
      let profile = await getProfileById(userId);
      
      if (!profile) {
        profile = await getProfileByUsername(userId);
      }
      
      if (!profile) {
        setIsNotFound(true);
      } else if (!profile.is_public) {
        setIsPrivate(true);
      }
    };

    fetchProfile();
  }, [userId, getProfileById, getProfileByUsername]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center"
           style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
        <div className="text-purple-400 text-2xl font-bold animate-pulse">LOADING PROFILE...</div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="min-h-screen bg-black text-white p-4"
           style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-purple-400">Profile</h1>
            <div className="w-16"></div>
          </div>

          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-purple-400 text-xl mb-2">Profile Not Found</div>
            <div className="text-gray-400 text-sm">
              This profile doesn't exist or has been removed.
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-bold hover:from-purple-600 hover:to-cyan-600 transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isPrivate || !viewedProfile) {
    return (
      <div className="min-h-screen bg-black text-white p-4"
           style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-purple-400">Profile</h1>
            <div className="w-16"></div>
          </div>

          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔒</div>
            <div className="text-purple-400 text-xl mb-2">Private Profile</div>
            <div className="text-gray-400 text-sm mb-4">
              This player's profile is private.
            </div>
            
            {/* Minimal info display */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 max-w-xs mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-xl font-bold">
                  {viewedProfile?.username?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div className="text-left">
                  <div className="text-white font-bold">
                    {viewedProfile?.username || 'Player'}
                  </div>
                  {viewedProfile?.avatar_emoji && (
                    <div className="text-2xl">{viewedProfile.avatar_emoji}</div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-bold hover:from-purple-600 hover:to-cyan-600 transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getProfileStats(viewedProfile);
  const countryFlag = getCountryFlag(viewedProfile.country_code);
  const countryName = getCountryName(viewedProfile.country_code);

  return (
    <div className="min-h-screen bg-black text-white p-4"
         style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-purple-400">Public Profile</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="relative z-10 mb-6">
        <div className="bg-gray-900/80 border border-purple-500/50 rounded-lg p-6 backdrop-blur-sm">
          {/* Avatar with Frame and Aura */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-3xl font-bold">
                {viewedProfile.username.charAt(0).toUpperCase()}
              </div>
              
              {/* Frame effect */}
              {viewedProfile.equipped_frame && (
                <div className="absolute inset-0 border-4 border-purple-400 rounded-full animate-pulse"></div>
              )}
              
              {/* Aura effect */}
              {viewedProfile.equipped_aura && (
                <div className="absolute inset-0 border-2 border-cyan-400 rounded-full animate-ping"></div>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <div className="text-xl font-bold text-white">
                  {viewedProfile.username}
                </div>
                {viewedProfile.equipped_title && (
                  <div className="text-yellow-400 font-bold">
                    [{getTitleDisplayName(viewedProfile.equipped_title)}]
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3 text-sm text-gray-400 mb-2">
                {viewedProfile.equipped_emoji && (
                  <span className="text-2xl">{viewedProfile.equipped_emoji}</span>
                )}
                {viewedProfile.avatar_emoji && (
                  <span className="text-2xl">{viewedProfile.avatar_emoji}</span>
                )}
                {countryFlag && (
                  <span title={countryName}>{countryFlag}</span>
                )}
              </div>
              
              {viewedProfile.bio && (
                <div className="text-gray-300 text-sm italic mb-2">
                  "{viewedProfile.bio}"
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                Joined {formatDate(viewedProfile.created_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Stats */}
      <div className="relative z-10 mb-6">
        <div className="bg-gray-900/80 border border-purple-500/50 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-purple-400 mb-3">Core Stats</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-cyan-400">{formatNumber(stats.total_duels)}</div>
              <div className="text-xs text-gray-400">Total Duels</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{formatNumber(stats.wins)}</div>
              <div className="text-xs text-gray-400">Wins</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-400">{formatNumber(stats.losses)}</div>
              <div className="text-xs text-gray-400">Losses</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">{stats.win_rate}%</div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-400">{formatNumber(stats.best_streak)}</div>
              <div className="text-xs text-gray-400">Best Streak</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-400">{formatNumber(stats.total_xp)}</div>
              <div className="text-xs text-gray-400">Total XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Level & Season */}
      <div className="relative z-10 mb-6">
        <div className="bg-gray-900/80 border border-purple-500/50 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-purple-400 mb-3">Progress</h3>
          
          {/* Level */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className={`font-bold ${getLevelColor(stats.level)}`}>Level {stats.level}</span>
              <span className="text-xs text-gray-400">{formatNumber(stats.total_xp)} XP</span>
            </div>
            <div className={`w-full rounded-full h-2 overflow-hidden ${getLevelBgColor(stats.level)}`}>
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.total_xp % 1000) / 10, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Season Tier */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`font-bold ${getSeasonTierColor(stats.current_season_tier)}`}>
                Tier {stats.current_season_tier}
              </span>
              <span className="text-xs text-gray-400">{formatNumber(stats.current_season_xp)} Season XP</span>
            </div>
            <div className={`w-full rounded-full h-2 overflow-hidden ${getSeasonTierBgColor(stats.current_season_tier)}`}>
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.current_season_xp % 1000) / 10, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="relative z-10 mb-6">
        <div className="bg-gray-900/80 border border-purple-500/50 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-purple-400 mb-3">Badges</h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-lg font-bold text-yellow-400">{stats.total_achievements_unlocked}</div>
              <div className="text-xs text-gray-400">Achievements</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">✨</div>
              <div className="text-lg font-bold text-purple-400">{stats.total_cosmetics_owned}</div>
              <div className="text-xs text-gray-400">Cosmetics</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-lg font-bold text-cyan-400">{stats.level}</div>
              <div className="text-xs text-gray-400">Level</div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipped Cosmetics */}
      <div className="relative z-10">
        <div className="bg-gray-900/80 border border-purple-500/50 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-purple-400 mb-3">Equipped Items</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {viewedProfile.equipped_aura && (
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">✨</div>
                <div className="text-sm font-bold text-purple-300">
                  {getCosmeticDisplayName(viewedProfile.equipped_aura)}
                </div>
                <div className="text-xs text-gray-400">Aura</div>
              </div>
            )}
            
            {viewedProfile.equipped_frame && (
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🖼️</div>
                <div className="text-sm font-bold text-cyan-300">
                  {getCosmeticDisplayName(viewedProfile.equipped_frame)}
                </div>
                <div className="text-xs text-gray-400">Frame</div>
              </div>
            )}
            
            {viewedProfile.equipped_emoji && (
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">{viewedProfile.equipped_emoji}</div>
                <div className="text-sm font-bold text-green-300">
                  {getCosmeticDisplayName(viewedProfile.equipped_emoji)}
                </div>
                <div className="text-xs text-gray-400">Emoji</div>
              </div>
            )}
            
            {viewedProfile.equipped_title && (
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🏷️</div>
                <div className="text-sm font-bold text-yellow-300">
                  {getTitleDisplayName(viewedProfile.equipped_title)}
                </div>
                <div className="text-xs text-gray-400">Title</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
