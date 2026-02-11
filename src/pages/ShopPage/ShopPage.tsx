import { useState, useEffect } from 'react';
import { Button, Cell, Section, Title } from '@telegram-apps/telegram-ui';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
  maxLevel: number;
  currentLevel: number;
}

export function ShopPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const telegramId = localStorage.getItem('telegram_id');
      if (!telegramId) return;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      setUser(data);
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUpgrades = (): Upgrade[] => {
    if (!user) return [];

    return [
      {
        id: 'tap_multiplier',
        name: 'Tap Multiplier',
        description: 'Increase taps per click',
        cost: Math.floor(100 * (user.tap_multiplier || 1.0)),
        effect: `x${((user.tap_multiplier || 1.0) + 0.1).toFixed(1)}`,
        maxLevel: 5,
        currentLevel: Math.floor((user.tap_multiplier || 1.0) - 1) * 10,
      },
      {
        id: 'energy_boost',
        name: 'Energy Boost',
        description: 'Increase max energy capacity',
        cost: 200,
        effect: '+20 max energy',
        maxLevel: 5,
        currentLevel: user.energy_boost || 0,
      },
      {
        id: 'energy_regen',
        name: 'Energy Regeneration',
        description: 'Faster energy recovery',
        cost: 150,
        effect: '+1 energy per minute',
        maxLevel: 3,
        currentLevel: 0, // This would need to be added to user table
      },
    ];
  };

  const purchaseUpgrade = async (upgradeId: string) => {
    if (!user) return;

    const upgrade = getUpgrades().find(u => u.id === upgradeId);
    if (!upgrade) return;

    if (user.score < upgrade.cost) {
      alert('Not enough points!');
      return;
    }

    if (upgrade.currentLevel >= upgrade.maxLevel) {
      alert('Maximum level reached!');
      return;
    }

    setPurchasing(upgradeId);

    try {
      let updateData: any = { score: user.score - upgrade.cost };

      switch (upgradeId) {
        case 'tap_multiplier':
          updateData.tap_multiplier = (user.tap_multiplier || 1.0) + 0.1;
          break;
        case 'energy_boost':
          updateData.energy_boost = (user.energy_boost || 0) + 20;
          updateData.energy = Math.min(user.energy + 20, 100 + (user.energy_boost || 0) + 20);
          break;
        case 'energy_regen':
          // This would require adding energy_regen_level to user table
          break;
      }

      const { data: updatedUser } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      setUser(updatedUser);
      alert(`🎉 Upgrade purchased: ${upgrade.name}!`);
    } catch (error) {
      console.error('Error purchasing upgrade:', error);
      alert('Error purchasing upgrade. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const upgrades = getUpgrades();

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-4">
      <div className="max-w-md mx-auto">
        <Title className="text-center mb-6 text-cyan-400 font-bold">
          🛒 UPGRADE SHOP 🛒
        </Title>

        <Section className="mb-4">
          <Cell>
            <div className="flex justify-between items-center">
              <span>Player: {user?.username}</span>
              <span>Level: {user?.level}</span>
            </div>
          </Cell>
          <Cell>
            <div className="flex justify-between items-center">
              <span>Points: {user?.score}</span>
              <span>Energy: {user?.energy}/{100 + (user?.energy_boost || 0)}</span>
            </div>
          </Cell>
        </Section>

        <Section className="mb-4">
          {upgrades.map((upgrade) => (
            <Cell key={upgrade.id}>
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-cyan-300">{upgrade.name}</h3>
                    <p className="text-sm text-cyan-500">{upgrade.description}</p>
                    <div className="text-xs text-cyan-400 mt-1">
                      Level: {upgrade.currentLevel}/{upgrade.maxLevel}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-cyan-400">{upgrade.cost} pts</div>
                    <div className="text-xs text-cyan-500">{upgrade.effect}</div>
                  </div>
                </div>
                
                <Button
                  onClick={() => purchaseUpgrade(upgrade.id)}
                  disabled={
                    purchasing === upgrade.id ||
                    (user?.score || 0) < upgrade.cost ||
                    upgrade.currentLevel >= upgrade.maxLevel
                  }
                  className={`w-full ${
                    upgrade.currentLevel >= upgrade.maxLevel
                      ? 'bg-gray-600 text-gray-400'
                      : purchasing === upgrade.id
                      ? 'bg-yellow-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  } font-bold py-2 px-4 rounded transition-all duration-200`}
                >
                  {upgrade.currentLevel >= upgrade.maxLevel
                    ? 'MAX LEVEL'
                    : purchasing === upgrade.id
                    ? 'PURCHASING...'
                    : 'PURCHASE'}
                </Button>
              </div>
            </Cell>
          ))}
        </Section>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button
            onClick={() => window.location.href = '/rewards'}
            className="bg-green-600 hover:bg-green-500 text-white"
          >
            🎁 REWARDS
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gray-600 hover:bg-gray-500 text-white"
          >
            🏠 HOME
          </Button>
        </div>
      </div>
    </div>
  );
}
