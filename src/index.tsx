// Debug Telegram Mini App - VERY FIRST CODE
console.log("Frontend loaded");
console.log("TG:", (window as any).Telegram?.WebApp);
console.log("initData:", (window as any).Telegram?.WebApp?.initData);
console.log("initDataUnsafe:", (window as any).Telegram?.WebApp?.initDataUnsafe);

// Global error handlers to catch silent crashes
window.addEventListener("error", (e) => console.error("Global error:", e.error));
window.addEventListener("unhandledrejection", (e) => console.error("Unhandled promise:", e.reason));

// Telegram Mini App initialization - BEFORE any imports
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Step 1: DOMContentLoaded");
  
  // Initialize Telegram Mini App SDK BEFORE any TonConnect usage
  try {
    // Import WebApp only after DOM is ready
    const WebApp = (await import('@twa-dev/sdk')).default;
    
    WebApp.ready();
    WebApp.expand();
    console.log("Step 2: Telegram Mini App SDK initialized");
    console.log("Mini App data:", WebApp.initDataUnsafe);
  } catch (e) {
    console.error("Telegram Mini App SDK failed:", e);
  }

  // Now safe to import other modules
  const ReactDOM = (await import('react-dom/client')).default;
  const { StrictMode } = await import('react');
  const { Root } = await import('@/components/Root.tsx');
  const { EnvUnsupported } = await import('@/components/EnvUnsupported.tsx');
  const { init } = await import('@/init.ts');

  // Include Telegram UI styles
  await import('@telegram-apps/telegram-ui/dist/styles.css');
  await import('./index.css');

  // Initialize React app after Telegram WebApp is ready
  const root = ReactDOM.createRoot(document.getElementById('root')!);

  try {
    // Read Telegram WebApp if available
    const tg = (window as any).Telegram?.WebApp;

    // Determine platform and debug mode
    const platform = tg?.platform || 'unknown';
    const debug = import.meta.env.DEV;

    console.log("Step 3: Configuring application dependencies");
    // Configure all application dependencies
    await init({
      debug,
      eruda: debug && ['ios', 'android'].includes(platform),
      mockForMacOS: platform === 'macos',
    });

    console.log("Step 4: Rendering React app");
    // Render the app - TON Connect is already initialized via direct export
    root.render(
      <StrictMode>
        <Root />
      </StrictMode>,
    );

    console.log("Step 5: App initialization complete");

  } catch (e) {
    console.error("App initialization failed:", e);
    root.render(<EnvUnsupported />);
  }
});
