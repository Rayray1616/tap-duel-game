import { useDuelClient } from '../realtime/DuelClient';

interface Props {
  duelId: string;
  playerId: string;
}

export default function DuelScreen({ duelId, playerId }: Props) {
  const {
    state,
    countdown,
    players,
    taps,
    result,
    sendTap,
  } = useDuelClient(duelId, playerId);

  if (state === 'countdown') {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h1 style={{ fontSize: 48 }}>{countdown}</h1>
      </div>
    );
  }

  if (state === 'finished' && result) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Duel Finished!</h2>
        <h3>Winner: {result.winner}</h3>

        <p>Your taps: {taps[playerId] || 0}</p>

        {result.second && (
          <p>Opponent taps: {taps[result.second] || 0}</p>
        )}

        <button
          onClick={() => {
            const duelId = "duel_" + Math.random().toString(36).slice(2, 10);
            const link = `https://t.me/tapduelbot?start=${duelId}`;
            window.Telegram?.WebApp?.openTelegramLink(link);
          }}
          style={{
            marginTop: 20,
            padding: "12px 24px",
            fontSize: 18,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Challenge a Friend
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h2>Duel Active!</h2>

      <h3>Your taps: {taps[playerId] || 0}</h3>

      <h3>Opponent taps:</h3>
      <ul>
        {players
          .filter((p) => p !== playerId)
          .map((p) => (
            <li key={p}>
              {p}: {taps[p] || 0}
            </li>
          ))}
      </ul>

      <button
        onClick={sendTap}
        style={{
          marginTop: 40,
          padding: '20px 40px',
          fontSize: 24,
          borderRadius: 12,
          cursor: 'pointer',
        }}
      >
        TAP!
      </button>
    </div>
  );
}
