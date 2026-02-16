import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TonConnectButton } from './TonConnectButton';
import { useTonMiniApp } from './TonMiniAppContext';

import { routes } from '@/navigation/routes.tsx';
import LobbyScreen from '../screens/LobbyScreen';
import DuelScreen from '../screens/DuelScreen';
import NewLobbyRedirect from '../screens/NewLobbyRedirect';
import { useTelegram } from '../telegram/useTelegram';

export function App() {
  const { tg, user, init } = useTelegram();
  const tonConnect = useTonMiniApp();
  const navigate = useNavigate();
  
  // Get wallet address from tonConnect instance
  const walletAddress = tonConnect.account?.address || null;

  useEffect(() => {
    init();
  }, []);

  // Store Telegram user ID as playerId, fallback to wallet address
  const basePlayerId = user?.id?.toString() || "local_" + Math.random().toString(36).slice(2);
  const playerId = walletAddress || basePlayerId;

  // Detect Telegram deep link start_param
  const startParam = tg?.initData?.start_param;

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
      <HashRouter>
        <Routes>
          {routes.map((route) => <Route key={route.path} {...route} />)}
          <Route path="/lobby/:duelId" element={<LobbyScreen playerId={playerId} walletAddress={walletAddress} />} />
          <Route path="/duel/:duelId" element={<DuelScreen playerId={playerId} walletAddress={walletAddress} />} />
          <Route path="/lobby/new" element={<NewLobbyRedirect />} />
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </HashRouter>
    </AppRoot>
  );
}
