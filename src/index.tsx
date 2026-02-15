// Debug Telegram Mini App - VERY FIRST CODE
console.log("Frontend loaded");
console.log("TG:", (window as any).Telegram?.WebApp);
console.log("initData:", (window as any).Telegram?.WebApp?.initData);
console.log("initDataUnsafe:", (window as any).Telegram?.WebApp?.initDataUnsafe);

// Global error handlers to catch silent crashes
window.addEventListener("error", (e) => console.error("Global error:", e.error));
window.addEventListener("unhandledrejection", (e) => console.error("Unhandled promise:", e.reason));

// Initialize Telegram WebApp - FIRST executable code
import WebApp from '@twa-dev/sdk';

// Include Telegram UI styles first to allow our code override the package CSS.
import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';
import { ensureTonConnectInitialized } from '@/lib/tonConnect';

import './index.css';

// TON Mini App initialization order
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Step 1: DOMContentLoaded");
  
  // Wait for Telegram WebApp to be ready
  if ((window as any).Telegram && (window as any).Telegram.WebApp) {
    console.log("Step 2: Telegram WebApp detected, calling ready()");
    (window as any).Telegram.WebApp.ready();
    console.log("Step 3: Telegram WebApp ready completed");
  } else {
    console.log("Step 2: Telegram WebApp not detected");
  }

  // Initialize React app after Telegram WebApp is ready
  const root = ReactDOM.createRoot(document.getElementById('root')!);

  try {
    // Read Telegram WebApp if available
    const tg = (window as any).Telegram?.WebApp;

    // Determine platform and debug mode
    const platform = tg?.platform || 'unknown';
    const debug = import.meta.env.DEV;

    console.log("Step 4: Configuring application dependencies");
    // Configure all application dependencies
    await init({
      debug,
      eruda: debug && ['ios', 'android'].includes(platform),
      mockForMacOS: platform === 'macos',
    });

    console.log("Step 5: Initializing TON Connect");
    // Initialize TON Connect after Telegram WebApp is ready
    await ensureTonConnectInitialized();

    console.log("Step 6: Rendering React app");
    // Render the app - TON Connect UI will use the initialized instance
    root.render(
      <StrictMode>
        <Root />
      </StrictMode>,
    );

    console.log("Step 7: App initialization complete");

  } catch (e) {
    console.error("App initialization failed:", e);
    root.render(<EnvUnsupported />);
  }
});
