import { useState, useEffect } from 'react';
import { useLaunchParams } from '@tma.js/sdk-react';
import { Button, Cell, Section, Title } from '@telegram-apps/telegram-ui';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];
type Duel = Database['public']['Tables']['duels']['Row'];

export function DuelPage() {
  const { initDataUnsafe } = useLaunchParams();
  const [user, setUser] = useState<User | null>(null);
  const [currentDuel, setCurrentDuel] = useState<Duel | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(false);
  const [opponentTaps, setOpponentTaps] = useState(0);

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameActive && timeLeft === 0) {
      endDuel();
    }
  }, [gameActive, timeLeft]);

  useEffect(() => {
    if (currentDuel && currentDuel.status === 'active') {
      const channel = supabase
        .channel(`duel:${currentDuel.id}`)
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'duels',
            filter: `id=eq.${currentDuel.id}`
          }, 
          (payload) => {
            const updatedDuel = payload.new as Duel;
            setCurrentDuel(updatedDuel);
            
            // Update opponent taps based on which player we are
            if (user) {
              if (updatedDuel.player1_id === user.id) {
                setOpponentTaps(updatedDuel.player2_taps);
              } else {
                setOpponentTaps(updatedDuel.player1_taps);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentDuel, user]);

  const initializeUser = async () => {
    const telegramUser = (initDataUnsafe as any)?.user;
    if (!telegramUser?.id) return;

    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id.toString())
        .single();

      setUser(data);
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const findDuel = async () => {
    if (!user || user.energy < 20) {
      alert('Not enough energy! You need at least 20 energy for a duel.');
      return;
    }

    setSearching(true);

    try {
      // Look for waiting duels first
      const { data: waitingDuels } = await supabase
        .from('duels')
        .select('*')
        .eq('status', 'waiting')
        .neq('player1_id', user.id)
        .limit(1);

      if (waitingDuels && waitingDuels.length > 0) {
        // Join existing duel
        const duel = waitingDuels[0];
        const { data: updatedDuel } = await supabase
          .from('duels')
          .update({
            player2_id: user.id,
            status: 'active',
            start_time: new Date().toISOString(),
          })
          .eq('id', duel.id)
          .select()
          .single();

        setCurrentDuel(updatedDuel);
        setGameActive(true);
        setTaps(0);
        setTimeLeft(10);
        
        // Deduct energy
        await supabase
          .from('users')
          .update({ energy: user.energy - 20 })
          .eq('id', user.id);
      } else {
        // Create new duel
        const { data: newDuel } = await supabase
          .from('duels')
          .insert({
            player1_id: user.id,
            status: 'waiting',
          })
          .select()
          .single();

        setCurrentDuel(newDuel);
        
        // Wait for opponent
        const checkInterval = setInterval(async () => {
          const { data: updatedDuel } = await supabase
            .from('duels')
            .select('*')
            .eq('id', newDuel.id)
            .single();

          if (updatedDuel && updatedDuel.status === 'active') {
            setCurrentDuel(updatedDuel);
            setGameActive(true);
            setTaps(0);
            setTimeLeft(10);
            clearInterval(checkInterval);
          }
        }, 1000);

        setTimeout(() => {
          clearInterval(checkInterval);
          if (!gameActive) {
            alert('No opponent found. Try again!');
            setSearching(false);
            setCurrentDuel(null);
          }
        }, 30000);
      }
    } catch (error) {
      console.error('Error finding duel:', error);
      alert('Error finding duel. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleTap = () => {
    if (!gameActive || timeLeft === 0 || !currentDuel || !user) return;
    
    const multiplier = user.tap_multiplier || 1.0;
    const newTaps = taps + Math.floor(multiplier);
    setTaps(newTaps);

    // Update taps in database
    const updateData = currentDuel.player1_id === user.id 
      ? { player1_taps: newTaps }
      : { player2_taps: newTaps };

    supabase
      .from('duels')
      .update(updateData)
      .eq('id', currentDuel.id);
  };

  const endDuel = async () => {
    setGameActive(false);
    
    if (!currentDuel || !user) return;

    const finalTaps = currentDuel.player1_id === user.id ? taps : currentDuel.player1_taps;
    const finalOpponentTaps = currentDuel.player1_id === user.id ? currentDuel.player2_taps : taps;
    
    let winnerId = null;
    let bonusPoints = 0;
    let resultMessage = '';
    let feeDeducted = 0;

    if (finalTaps > finalOpponentTaps) {
      winnerId = user.id;
      bonusPoints = 50;
      
      // Calculate 10% fee on winnings (taps + bonus)
      const totalWinnings = finalTaps + bonusPoints;
      feeDeducted = Math.floor(totalWinnings * 0.1); // 10% fee, rounded down
      const netWinnings = totalWinnings - feeDeducted;
      
      resultMessage = `🎉 VICTORY! You won with ${finalTaps} vs ${finalOpponentTaps} taps!\n` +
                     `🏆 +${finalTaps} taps + ${bonusPoints} bonus = ${totalWinnings} total\n` +
                     `💸 10% fee: -${feeDeducted} points\n` +
                     `💰 Net: +${netWinnings} points!`;
    } else if (finalTaps < finalOpponentTaps) {
      resultMessage = `😔 DEFEAT! You lost with ${finalTaps} vs ${finalOpponentTaps} taps.`;
    } else {
      resultMessage = `🤝 DRAW! Both players got ${finalTaps} taps!`;
    }

    // Update duel
    await supabase
      .from('duels')
      .update({
        end_time: new Date().toISOString(),
        winner_id: winnerId,
        status: 'completed',
        fee_amount: feeDeducted,
      })
      .eq('id', currentDuel.id);

    // Update user score (with fee deducted if winner)
    const newScore = user.score + finalTaps + bonusPoints - feeDeducted;
    await supabase
      .from('users')
      .update({ score: newScore })
      .eq('id', user.id);

    // Record fee transaction if fee was deducted
    if (feeDeducted > 0) {
      await supabase
        .from('fee_transactions')
        .insert({
          duel_id: currentDuel.id,
          winner_id: user.id,
          fee_amount: feeDeducted,
          total_winnings: finalTaps + bonusPoints,
          created_at: new Date().toISOString()
        });
    }

    alert(resultMessage);
    setCurrentDuel(null);
    setTaps(0);
    setOpponentTaps(0);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-4">
      <div className="max-w-md mx-auto">
        <Title className="text-center mb-6 text-cyan-400 font-bold">
          ⚔️ DUEL ARENA ⚔️
        </Title>

        <Section className="mb-4">
          <Cell>
            <div className="flex justify-between items-center">
              <span>Player: {user?.username}</span>
              <span>Energy: {user?.energy}/100</span>
            </div>
          </Cell>
          <Cell>
            <div className="flex justify-between items-center">
              <span>Score: {user?.score}</span>
              <span>Level: {user?.level}</span>
            </div>
          </Cell>
        </Section>

        {!currentDuel ? (
          <div className="text-center">
            <Button
              onClick={findDuel}
              disabled={searching || (user?.energy || 0) < 20}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-8 rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-200 transform hover:scale-105"
            >
              {searching ? 'SEARCHING...' : 'FIND DUEL (20 Energy)'}
            </Button>
            {searching && (
              <div className="mt-4 text-cyan-300">
                Looking for opponent... Please wait...
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="text-center mb-4">
              <div className="text-xl font-bold text-cyan-300 mb-2">
                {currentDuel.status === 'waiting' ? 'Waiting for opponent...' : 'DUEL IN PROGRESS!'}
              </div>
            </div>

            {gameActive && (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-sm text-cyan-300">You</div>
                    <div className="text-3xl font-bold text-cyan-400">{taps}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-cyan-300">Opponent</div>
                    <div className="text-3xl font-bold text-cyan-400">{opponentTaps}</div>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-2xl text-cyan-400">Time: {timeLeft}s</div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={handleTap}
                    className="w-48 h-48 bg-purple-600 hover:bg-purple-500 rounded-full shadow-lg shadow-purple-500/50 transition-all duration-100 transform active:scale-95 text-white text-2xl font-bold"
                    style={{
                      boxShadow: '0 0 30px rgba(147, 51, 234, 0.5), inset 0 0 30px rgba(147, 51, 234, 0.2)',
                    }}
                  >
                    TAP!
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gray-600 hover:bg-gray-500 text-white w-full"
          >
            🏠 HOME
          </Button>
        </div>
      </div>
    </div>
  );
}
