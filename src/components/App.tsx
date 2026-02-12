import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { useLaunchParams, useMiniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { useEffect } from 'react';

import { routes } from '@/navigation/routes.tsx';
import LobbyScreen from '../screens/LobbyScreen';
import DuelScreen from '../screens/DuelScreen';
import { useTelegram } from './telegram/useTelegram';

export function App() {
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const isDark = miniApp.isDark;
  const { tg, user, init } = useTelegram();

  useEffect(() => {
    init();
  }, []);

  // Store Telegram user ID as playerId
  const playerId = user?.id?.toString() || "local_" + Math.random().toString(36).slice(2);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
    >
      <HashRouter>
        <Routes>
          {routes.map((route) => <Route key={route.path} {...route} />)}
          <Route path="/lobby/:duelId" element={<LobbyScreen playerId={playerId} />} />
          <Route path="/duel/:duelId" element={<DuelScreen playerId={playerId} />} />
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </HashRouter>
    </AppRoot>
  );
}
