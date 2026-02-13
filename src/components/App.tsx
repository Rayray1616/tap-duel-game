import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { useLaunchParams, useMiniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TonConnectUIProvider, TonConnectButton, useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";

import { routes } from '@/navigation/routes.tsx';
import LobbyScreen from '../screens/LobbyScreen';
import DuelScreen from '../screens/DuelScreen';
import NewLobbyRedirect from '../screens/NewLobbyRedirect';
import { useTelegram } from '../telegram/useTelegram';

export function App() {
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const isDark = miniApp.isDark;
  const { tg, user, init } = useTelegram();
  const navigate = useNavigate();
  const walletAddress = useTonAddress();

  useEffect(() => {
    init();
  }, []);

  // Store Telegram user ID as playerId, fallback to wallet address
  const basePlayerId = user?.id?.toString() || "local_" + Math.random().toString(36).slice(2);
  const playerId = walletAddress || basePlayerId;

  // Detect Telegram deep link start_param
  const startParam = tg?.initDataUnsafe?.start_param;

  useEffect(() => {
    if (startParam && startParam.startsWith("duel_")) {
      const duelId = startParam.replace("duel_", "");
      navigate(`/lobby/${duelId}`);
    }
  }, [startParam, navigate]);

  return (
    <TonConnectUIProvider manifestUrl="https://tap-duel-game.railway.app/tonconnect-manifest.json">
      <AppRoot
        appearance={isDark ? 'dark' : 'light'}
        platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
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
    </TonConnectUIProvider>
  );
}
