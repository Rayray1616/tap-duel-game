// Debug - Frontend loading
console.log("Frontend loaded");

// Global error handlers to catch silent crashes
window.addEventListener("error", (e) => console.error("Global error:", e.error));
window.addEventListener("unhandledrejection", (e) => console.error("Unhandled promise:", e.reason));

// App initialization - BEFORE any imports
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Step 1: DOMContentLoaded");
  
  // Telegram Mini App SDK completely removed
  console.log("Step 2: Telegram Mini App SDK removed - no initialization needed");

  // Now safe to import other modules
  const ReactDOM = (await import('react-dom/client')).default;
  const { StrictMode } = await import('react');
  const { Root } = await import('@/components/Root.tsx');
  const { EnvUnsupported } = await import('@/components/EnvUnsupported.tsx');
  const { init } = await import('@/init.ts');

  // Include Telegram UI styles
  await import('@telegram-apps/telegram-ui/dist/styles.css');
  await import('./index.css');

  // Initialize React app
  const root = ReactDOM.createRoot(document.getElementById('root')!);

  try {
    // Determine debug mode
    const debug = import.meta.env.DEV;

    console.log("Step 3: Configuring application dependencies");
    // Configure all application dependencies
    await init({
      debug,
      eruda: debug, // Enable eruda in debug mode regardless of platform
    });

    console.log("Step 4: Rendering React app");
    // Render the app
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
