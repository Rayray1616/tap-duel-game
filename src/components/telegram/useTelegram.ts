export function useTelegram() {
  const tg = (window as any).Telegram?.WebApp;

  return {
    tg,
    initData: tg?.initData || '',
    user: tg?.initDataUnsafe?.user || null,
    queryId: tg?.initDataUnsafe?.query_id || '',
    themeParams: tg?.themeParams || {}
  };
}
