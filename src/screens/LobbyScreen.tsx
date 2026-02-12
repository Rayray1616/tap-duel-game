import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDuelClient } from '../realtime/DuelClient';
import { useState } from "react";

interface Props {
  duelId: string;
  playerId: string;
  walletAddress?: string;
}

export default function LobbyScreen({ duelId, playerId, walletAddress }: Props) {
  const navigate = useNavigate();
  const {
    state,
    countdown,
    players,
  } = useDuelClient(duelId, playerId);

  const shortWallet = walletAddress
    ? walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4)
    : null;

  const [tonBalance, setTonBalance] = useState(null);
  const [stakeTon, setStakeTon] = useState("");

  useEffect(() => {
    if (!walletAddress) return;

    fetch(`/api/ton/balance?address=${walletAddress}`)
      .then(res => res.json())
      .then(data => setTonBalance(data.balance))
      .catch(err => console.error("TON balance fetch error:", err));
  }, [walletAddress]);

  useEffect(() => {
    if (state === 'active') {
      navigate(`/duel/${duelId}?stake=${stakeTon}`);
    }
  }, [state, duelId, playerId, navigate, stakeTon]);

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      {shortWallet && (
        <div style={{ marginBottom: 12, fontSize: 14, opacity: 0.8 }}>
          Wallet: {shortWallet}
        </div>
      )}
      {tonBalance !== null && (
        <div style={{ marginBottom: 12, fontSize: 14, opacity: 0.8 }}>
          Balance: {tonBalance / 1e9} TON
        </div>
      )}
      {walletAddress && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, opacity: 0.8 }}>Stake (TON):</label>
          <input
            type="number"
            value={stakeTon}
            onChange={(e) => setStakeTon(e.target.value)}
            placeholder="0.1"
            min="0"
            step="0.01"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #ccc",
              marginTop: 6
            }}
          />
        </div>
      )}
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
