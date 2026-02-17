import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useGems } from '@/hooks/useGems';
import { useTelegram } from '@/telegram/useTelegram';
import { 
  getRarityColor, 
  getRarityBorderColor, 
  getRarityBgColor, 
  getRarityTextColor,
  getCosmeticIcon,
  getCosmeticDisplayValue,
  getCosmeticTypeLabel,
  getCosmeticTypeDescription,
  getCosmeticDisplayName
} from '@/data/cosmetics';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const { 
    profile, 
    userCosmetics, 
    userTitles, 
    loading, 
    updating, 
    equipCosmetic, 
    equipTitle,
    getEquippedAura,
    getEquippedFrame,
    getEquippedEmoji,
    getEquippedTitle,
    getOwnedCosmeticsByType,
    getUnownedCosmeticsByType,
    getOwnedTitles,
    getUnownedTitles,
    getProfileDisplay
  } = useProfile(user?.id?.toString());
  const { gemsInfo } = useGems(user?.id?.toString());
  const [activeTab, setActiveTab] = useState<'aura' | 'frame' | 'emoji' | 'title'>('aura');
  const [showEquipAnimation, setShowEquipAnimation] = useState(false);
  const [equippedItem, setEquippedItem] = useState<string>('');

  const profileDisplay = getProfileDisplay();

  const handleEquipCosmetic = async (cosmeticKey: string, cosmeticName: string) => {
    try {
      const result = await equipCosmetic(cosmeticKey);
      
      if (result?.success) {
        setEquippedItem(cosmeticName);
        setShowEquipAnimation(true);
        setTimeout(() => setShowEquipAnimation(false), 2000);
      }
    } catch (error) {
      console.error('Error equipping cosmetic:', error);
    }
  };

  const handleEquipTitle = async (titleKey: string, titleName: string) => {
    try {
      const result = await equipTitle(titleKey);
      
      if (result?.success) {
        setEquippedItem(titleName);
        setShowEquipAnimation(true);
        setTimeout(() => setShowEquipAnimation(false), 2000);
      }
    } catch (error) {
      console.error('Error equipping title:', error);
    }
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'aura':
        return {
          owned: getOwnedCosmeticsByType('aura'),
          unowned: getUnownedCosmeticsByType('aura')
        };
      case 'frame':
        return {
          owned: getOwnedCosmeticsByType('frame'),
          unowned: getUnownedCosmeticsByType('frame')
        };
      case 'emoji':
        return {
          owned: getOwnedCosmeticsByType('emoji'),
          unowned: getUnownedCosmeticsByType('emoji')
        };
      case 'title':
        return {
          owned: getOwnedTitles(),
          unowned: getUnownedTitles()
        };
      default:
        return { owned: [], unowned: [] };
    }
  };

  const renderCosmeticCard = (item: any, isOwned: boolean) => {
    const isEquipped = item.equipped;
    const displayValue = activeTab === 'title' ? item.name : getCosmeticDisplayValue(item.cosmetic_key || item.title_key);
    const displayName = activeTab === 'title' ? item.name : getCosmeticDisplayName(item.cosmetic_key || item.title_key);
    const rarity = item.rarity || 'common';

    return (
      <div
        key={item.cosmetic_key || item.title_key}
        className={`relative p-3 rounded-lg border transition-all duration-300 ${
          isEquipped 
            ? `${getRarityBorderColor(rarity)} ${getRarityBgColor(rarity)} ring-2 ring-cyan-400/50` 
            : isOwned 
              ? `${getRarityBorderColor(rarity)} ${getRarityBgColor(rarity)} hover:scale-105`
              : 'border-gray-700 bg-gray-900/50 opacity-50'
        }`}
      >
        {isEquipped && (
          <div className="absolute top-1 right-1 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            EQUIPPED
          </div>
        )}
        
        <div className="text-center">
          <div className="text-3xl mb-2">
            {activeTab === 'title' ? '🏷️' : displayValue}
          </div>
          <div className={`text-sm font-bold mb-1 ${getRarityTextColor(rarity)}`}>
            {displayName}
          </div>
          {activeTab !== 'title' && (
            <div className="text-xs text-gray-400 mb-2">
              {item.rarity?.toUpperCase()}
            </div>
          )}
          
          {isOwned && !isEquipped && (
            <button
              onClick={() => activeTab === 'title' 
                ? handleEquipTitle(item.title_key, displayName)
                : handleEquipCosmetic(item.cosmetic_key, displayName)
              }
              disabled={updating}
              className="w-full bg-gradient-to-r from-cyan-500 to-magenta-500 text-white px-3 py-1 rounded text-xs font-bold hover:from-cyan-600 hover:to-magenta-600 transition-all disabled:opacity-50"
            >
              {updating ? 'Equipping...' : 'Equip'}
            </button>
          )}
          
          {!isOwned && (
            <div className="text-xs text-gray-500">
              Not Owned
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center"
           style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
        <div className="text-cyan-400 text-2xl font-bold animate-pulse">LOADING PROFILE...</div>
      </div>
    );
  }

  const tabContent = getTabContent();

  return (
    <div className="min-h-screen bg-black text-white p-4"
         style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-black to-magenta-900/20"></div>
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
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
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-cyan-400">Profile</h1>
          <div className="text-cyan-400">
            💎 {gemsInfo?.gems || 0}
          </div>
        </div>

        {/* Profile Display */}
        <div className="bg-gray-900/80 border border-cyan-500/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            {/* Avatar with Frame */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-magenta-500 rounded-full flex items-center justify-center text-2xl font-bold">
                {profileDisplay?.username?.charAt(0).toUpperCase() || 'P'}
              </div>
              {profileDisplay?.frame && (
                <div className="absolute inset-0 border-2 border-cyan-400 rounded-full animate-pulse"></div>
              )}
              {profileDisplay?.aura && (
                <div className="absolute inset-0 border-2 border-magenta-400 rounded-full animate-ping"></div>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <div className="text-lg font-bold text-white">
                {profileDisplay?.username || 'Player'}
              </div>
              {profileDisplay?.title && (
                <div className="text-sm text-yellow-400">
                  [{profileDisplay.title}]
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                {profileDisplay?.emoji && <span>{profileDisplay.emoji}</span>}
                <span>Level 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative z-10 mb-4">
        <div className="flex space-x-2 bg-gray-900/50 rounded-lg p-1">
          {(['aura', 'frame', 'emoji', 'title'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-magenta-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {getCosmeticIcon(tab)} {getCosmeticTypeLabel(tab)}
            </button>
          ))}
        </div>
        
        {/* Tab Description */}
        <div className="mt-2 text-center text-xs text-gray-400">
          {getCosmeticTypeDescription(activeTab)}
        </div>
      </div>

      {/* Content Grid */}
      <div className="relative z-10">
        {/* Owned Items */}
        {tabContent.owned.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Owned</h3>
            <div className="grid grid-cols-3 gap-3">
              {tabContent.owned.map((item) => renderCosmeticCard(item, true))}
            </div>
          </div>
        )}

        {/* Unowned Items */}
        {tabContent.unowned.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-400 mb-3">Locked</h3>
            <div className="grid grid-cols-3 gap-3">
              {tabContent.unowned.map((item) => renderCosmeticCard(item, false))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tabContent.owned.length === 0 && tabContent.unowned.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎁</div>
            <div className="text-cyan-400 text-xl">No {getCosmeticTypeLabel(activeTab)} Available</div>
            <div className="text-gray-400 text-sm mt-2">
              Complete challenges and unlock rewards to get cosmetics!
            </div>
          </div>
        )}
      </div>

      {/* Equip Animation */}
      {showEquipAnimation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-4">✨</div>
            <div className="text-3xl font-bold text-cyan-400 mb-2">Equipped!</div>
            <div className="text-xl text-cyan-300">{equippedItem}</div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        .neon-profile-card {
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 255, 0.05) 100%);
          border: 2px solid rgba(0, 255, 255, 0.3);
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.2),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
        }
        
        .neon-profile-card:hover {
          border-color: rgba(0, 255, 255, 0.5);
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.3),
            inset 0 0 30px rgba(0, 255, 255, 0.2);
        }
        
        .neon-cosmetic-card {
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 255, 0.05) 100%);
          border: 2px solid rgba(0, 255, 255, 0.3);
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.2),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
        }
        
        .neon-cosmetic-card:hover {
          transform: scale(1.05);
          border-color: rgba(0, 255, 255, 0.5);
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.3),
            inset 0 0 30px rgba(0, 255, 255, 0.2);
        }
        
        .neon-equip-button {
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.3) 0%, rgba(255, 0, 255, 0.2) 100%);
          border: 2px solid rgba(0, 255, 255, 0.5);
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.4),
            inset 0 0 20px rgba(0, 255, 255, 0.2);
        }
        
        .neon-equip-button:hover {
          transform: scale(1.05);
          border-color: rgba(0, 255, 255, 0.7);
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.6),
            inset 0 0 30px rgba(0, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
