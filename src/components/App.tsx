import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { useLaunchParams, useSignal, miniApp } from '@tma.js/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { routes } from '@/navigation/routes.tsx';

function FallbackUI() {
  return (
    <div className="min-h-screen bg-black text-cyan-400 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-4 neon-text glitch">🔥 TAP DUEL 🔥</h1>
          <div className="text-xl neon-text mb-6">Cyberpunk Battle Arena</div>
        </div>
        
        <div className="mb-8 neon-border p-6">
          <p className="text-lg neon-text mb-4">
            Open this Mini App from your Telegram bot to play!
          </p>
          <a 
            href="https://t.me/tap_duel_bot" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block neon-button pulse font-bold py-4 px-8 rounded-lg text-white no-underline"
          >
            🚀 Open Bot
          </a>
        </div>
        
        <div className="text-sm neon-text opacity-70">
          <p>⚡ Connect TON Wallet</p>
          <p>⚔️ Real-time Duels</p>
          <p>🏆 Leaderboards</p>
          <p>💎 Cyberpunk Rewards</p>
        </div>
      </div>
    </div>
  );
}

export function App() {
  // Check if running in Telegram
  const isTelegram = typeof window !== 'undefined' && 
    (window as any).Telegram?.WebApp?.initData;

  if (!isTelegram) {
    return <FallbackUI />;
  }

  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <HashRouter>
        <Routes>
          {routes.map((route) => <Route key={route.path} {...route} />)}
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </HashRouter>
    </AppRoot>
  );
}
