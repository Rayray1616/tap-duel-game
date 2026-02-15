// Initialize Telegram WebApp - FIRST executable code
import WebApp from '@twa-dev/sdk';

// Ensure the script runs only inside Telegram WebApp context
if ((window as any).Telegram?.WebApp) {
  WebApp.ready();
  console.log("Launch params:", WebApp.initData);
} else {
  console.log("Not running in Telegram WebApp context");
}

// Include Telegram UI styles first to allow our code override the package CSS.
import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  // Read Telegram WebApp if available
  const tg = (window as any).Telegram?.WebApp;

  // Determine platform and debug mode
  const platform = tg?.platform || 'unknown';
  const debug = import.meta.env.DEV;

  // Initialize Telegram WebApp if present
  if (tg) {
    tg.ready();
  }

  // Configure all application dependencies
  await init({
    debug,
    eruda: debug && ['ios', 'android'].includes(platform),
    mockForMacOS: platform === 'macos',
  });

  // Render the app
  root.render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );

} catch (e) {
  root.render(<EnvUnsupported />);
}
