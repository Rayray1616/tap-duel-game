import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

export function useEnergyRegeneration(user: User | null, setUser: (user: User | null) => void) {
  const [lastRegen, setLastRegen] = useState<string>(user?.last_energy_regen || new Date().toISOString());

  useEffect(() => {
    if (!user) return;

    const regenInterval = setInterval(async () => {
      const now = new Date();
      const lastRegenTime = new Date(user.last_energy_regen);
      const minutesSinceRegen = Math.floor((now.getTime() - lastRegenTime.getTime()) / (1000 * 60));

      if (minutesSinceRegen >= 1 && user.energy < 100) {
        const energyToRegen = Math.min(minutesSinceRegen * 2, 100 - user.energy);
        const newEnergy = user.energy + energyToRegen;
        
        try {
          const { data: updatedUser } = await supabase
            .from('users')
            .update({
              energy: newEnergy,
              last_energy_regen: now.toISOString(),
            })
            .eq('id', user.id)
            .select()
            .single();

          if (updatedUser) {
            setUser(updatedUser);
            setLastRegen(updatedUser.last_energy_regen);
          }
        } catch (error) {
          console.error('Error regenerating energy:', error);
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(regenInterval);
  }, [user, setUser]);

  return { lastRegen };
}
