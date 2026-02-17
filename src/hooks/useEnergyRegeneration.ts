import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

export function useEnergyRegeneration(user: User | null, setUser: (user: User | null) => void) {
  const [lastRegen, setLastRegen] = useState<string>(user?.last_energy_regen || new Date().toISOString());

  useEffect(() => {
    if (!user) return;

    const regenInterval = setInterval(async () => {
      // Get fresh user data to avoid stale closure
      const currentUser = user;
      if (!currentUser) return;

      const now = new Date();
      const lastRegenTime = new Date(currentUser.last_energy_regen);
      const minutesSinceRegen = Math.floor((now.getTime() - lastRegenTime.getTime()) / (1000 * 60));

      if (minutesSinceRegen >= 1 && currentUser.energy < 100) {
        const energyToRegen = Math.min(minutesSinceRegen * 2, 100 - currentUser.energy);
        const newEnergy = currentUser.energy + energyToRegen;
        
        try {
          const { data: updatedUser } = await supabase
            .from('users')
            .update({
              energy: newEnergy,
              last_energy_regen: now.toISOString(),
            })
            .eq('id', currentUser.id)
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
