export function useTelegram() {
  const tg = (window as any).Telegram?.WebApp;

  // Check if we're in Telegram WebApp with valid initData
  const isTelegramWebApp = tg && tg.initData;
  
  if (!isTelegramWebApp) {
    // Return safe defaults when not in Telegram
    return {
      tg: null,
      initData: '',
      user: null,
      queryId: '',
      themeParams: {},
      isTelegramWebApp: false
    };
  }

  return {
    tg,
    initData: tg.initData || '',
    user: tg.initData?.user || null,
    queryId: tg.initData?.query_id || '',
    themeParams: tg.themeParams || {},
    isTelegramWebApp: true
  };
}
