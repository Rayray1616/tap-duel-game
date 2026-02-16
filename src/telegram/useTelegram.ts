export function useTelegram() {
  const tg = (window as any).Telegram?.WebApp;

  // Check if we're in Telegram WebApp with valid initData
  const isTelegramWebApp = tg && tg.initData;
  
  if (!isTelegramWebApp) {
    // Return safe defaults when not in Telegram
    return {
      tg: null,
      user: null,
      init: () => {
        // No-op when not in Telegram
        console.warn('Telegram WebApp not available - skipping initialization');
      },
      isTelegramWebApp: false
    };
  }

  return {
    tg,
    user: tg.initData?.user,
    init: () => {
      tg?.expand();
      tg?.disableVerticalSwipe();
      tg?.enableClosingConfirmation();
    },
    isTelegramWebApp: true
  };
}
