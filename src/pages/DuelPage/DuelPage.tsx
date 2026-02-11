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
        <Title className="text-center mb-6 text-5xl font-black neon-text glitch">
          ⚔️ DUEL ARENA ⚔️
        </Title>

        <Section className="mb-4 neon-border">
          <Cell>
            <div className="flex justify-between items-center">
              <span className="neon-text">👤 Player: {user?.username}</span>
              <span className="neon-text">⚡ Energy: {user?.energy}/100</span>
            </div>
          </Cell>
          <Cell>
            <div className="flex justify-between items-center">
              <span className="neon-text">💎 Score: {user?.score}</span>
              <span className="neon-text">⭐ Level: {user?.level}</span>
            </div>
          </Cell>
        </Section>

        {!currentDuel ? (
          <div className="text-center">
            <Button
              onClick={findDuel}
              disabled={searching || (user?.energy || 0) < 20}
              className="neon-button pulse font-bold py-6 px-12 rounded-lg text-xl transition-all duration-300 hover:scale-105 shadow-[0_0_30px_#00ffff,0_0_60px_#00aaff] ring-cyan-500/50"
              style={{
                background: 'linear-gradient(135deg, #00ffff 0%, #0088ff 50%, #0044aa 100%)',
              }}
            >
              {searching ? '⚡ SEARCHING... ⚡' : '⚔️ FIND DUEL (20 Energy) ⚔️'}
            </Button>
            {searching && (
              <div className="mt-4 text-xl neon-text animate-pulse">
                🔍 Looking for opponent... Please wait... 🔍
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="text-3xl font-black neon-text glitch mb-4">
                {currentDuel.status === 'waiting' ? '⏳ WAITING FOR OPPONENT... ⏳' : '⚡ DUEL IN PROGRESS! ⚡'}
              </div>
            </div>

            {gameActive && (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="text-center neon-border p-4 rounded-lg transition-all duration-300 hover:scale-105">
                    <div className="text-lg neon-text mb-3 font-bold">⚔️ YOU</div>
                    <div className="text-6xl font-black neon-text glitch animate-pulse">{taps}</div>
                  </div>
                  <div className="text-center neon-border p-4 rounded-lg transition-all duration-300 hover:scale-105">
                    <div className="text-lg neon-text mb-3 font-bold">👹 OPPONENT</div>
                    <div className="text-6xl font-black neon-text glitch animate-pulse">{opponentTaps}</div>
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <div className="text-5xl neon-text breathe font-black">⚡ TIME: {timeLeft}s ⚡</div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={handleTap}
                    className="w-72 h-72 rounded-full transition-all duration-100 transform active:scale-95 text-white text-5xl font-black neon-border pulse breathe relative overflow-hidden"
                    style={{
                      background: 'radial-gradient(circle, #00ffff 0%, #0088ff 30%, #0044aa 70%, #002255 100%)',
                      boxShadow: '0 0 60px #00ffff, 0 0 120px #00ffff, 0 0 180px #0088ff, inset 0 0 60px rgba(0, 255, 255, 0.6)',
                    }}
                  >
                    <span className="relative z-10 drop-shadow-2xl animate-pulse">TAP!</span>
                    <div className="absolute inset-0 rounded-full bg-white opacity-0 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 animate-pulse"></div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <Button
            onClick={() => window.location.href = '/'}
            className="neon-button pulse font-bold py-4 px-8 rounded-lg w-full text-lg transition-all duration-300 hover:scale-105 shadow-[0_0_30px_#00ffff,0_0_60px_#00aaff] ring-cyan-500/50"
            style={{
              background: 'linear-gradient(135deg, #00ffff 0%, #0088ff 50%, #0044aa 100%)',
            }}
          >
            🏠 HOME
          </Button>
        </div>
      </div>
    </div>
  );
}
