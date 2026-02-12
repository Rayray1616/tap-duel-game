import { useEffect, useRef, useState } from 'react';

export function useDuelClient(duelId: string, playerId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<'waiting' | 'countdown' | 'active' | 'finished'>('waiting');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [taps, setTaps] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const ws = new WebSocket(`wss://${window.location.host}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'join',
        duelId,
        playerId,
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === 'players') {
        setPlayers(msg.players);
        setState(msg.state);
      }

      if (msg.type === 'countdown') {
        setCountdown(msg.value);
        setState('countdown');
      }

      if (msg.type === 'start') {
        setCountdown(null);
        setState('active');
      }

      if (msg.type === 'tap_update') {
        setTaps((prev) => ({
          ...prev,
          [msg.playerId]: msg.taps,
        }));
      }

      if (msg.type === 'result') {
        setState('finished');
        setResult(msg);
      }
    };

    return () => {
      ws.close();
    };
  }, [duelId, playerId]);

  function sendTap() {
    if (!wsRef.current) return;
    wsRef.current.send(JSON.stringify({
      type: 'tap',
      duelId,
      playerId,
    }));
  }

  return {
    state,
    countdown,
    players,
    taps,
    result,
    sendTap,
  };
}
