import { Navigate, Route, Routes } from 'react-router-dom';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TonConnectButton } from './TonConnectButton';

import { routes } from '@/navigation/routes.tsx';
import LobbyScreen from '../screens/LobbyScreen';
import DuelScreen from '../screens/DuelScreen';
import NewLobbyRedirect from '../screens/NewLobbyRedirect';
import { useTelegram } from "@/telegram/useTelegram";

// Wrapper components to extract route params
function LobbyScreenWrapper() {
  const { duelId } = useParams<{ duelId: string }>();
  const { user } = useTelegram();
  const playerId = user?.id?.toString() || "guest_" + Math.random().toString(36).slice(2);
  
  if (!duelId) return <Navigate to="/" />;
  return <LobbyScreen duelId={duelId} playerId={playerId} />;
}

function DuelScreenWrapper() {
  const { duelId } = useParams<{ duelId: string }>();
  const { user } = useTelegram();
  const playerId = user?.id?.toString() || "guest_" + Math.random().toString(36).slice(2);
  
  if (!duelId) return <Navigate to="/" />;
  return <DuelScreen duelId={duelId} playerId={playerId} />;
}

export function App() {
  const { user } = useTelegram();
  const navigate = useNavigate();

  // Store Telegram user ID as playerId
  const playerId = user?.id?.toString() || "guest_" + Math.random().toString(36).slice(2);

  // Detect Telegram deep link start_param
  const startParam = (window as any).Telegram?.WebApp?.initData?.start_param;

  useEffect(() => {
    if (startParam && startParam.startsWith("duel_")) {
      const duelId = startParam.replace("duel_", "");
      navigate(`/lobby/${duelId}`);
    }
  }, [startParam, navigate]);

  return (
    <AppRoot
      appearance="light"
      platform="base"
    >
      <div style={{ padding: 12, display: "flex", justifyContent: "flex-end" }}>
        <TonConnectButton />
      </div>
      <Routes>
        {routes.map((route) => <Route key={route.path} {...route} />)}
        <Route path="/lobby/:duelId" element={<LobbyScreenWrapper />} />
        <Route path="/duel/:duelId" element={<DuelScreenWrapper />} />
        <Route path="/lobby/new" element={<NewLobbyRedirect />} />
        <Route path="*" element={<Navigate to="/"/>}/>
      </Routes>
    </AppRoot>
  );
}
