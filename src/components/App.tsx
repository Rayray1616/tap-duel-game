import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { useLaunchParams, useMiniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { routes } from '@/navigation/routes.tsx';
import LobbyScreen from '../screens/LobbyScreen';
import DuelScreen from '../screens/DuelScreen';

export function App() {
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const isDark = miniApp.isDark;

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
    >
      <HashRouter>
        <Routes>
          {routes.map((route) => <Route key={route.path} {...route} />)}
          <Route path="/lobby/:duelId/:playerId" element={<LobbyScreen />} />
          <Route path="/duel/:duelId/:playerId" element={<DuelScreen />} />
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </HashRouter>
    </AppRoot>
  );
}
