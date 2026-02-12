import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDuelClient } from '../realtime/DuelClient';

interface Props {
  duelId: string;
  playerId: string;
}

export default function LobbyScreen({ duelId, playerId }: Props) {
  const navigate = useNavigate();
  const {
    state,
    countdown,
    players,
  } = useDuelClient(duelId, playerId);

  useEffect(() => {
    if (state === 'active') {
      navigate(`/duel/${duelId}/${playerId}`);
    }
  }, [state, duelId, playerId, navigate]);

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h2>Waiting for Opponent…</h2>

      <p>Duel ID: {duelId}</p>

      <h3>Players Connected:</h3>
      <ul>
        {players.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>

      {state === 'countdown' && (
        <h1 style={{ fontSize: 48 }}>{countdown}</h1>
      )}

      {state === 'waiting' && (
        <p>Waiting for second player…</p>
      )}
    </div>
  );
}
