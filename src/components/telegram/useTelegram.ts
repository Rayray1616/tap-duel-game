export function useTelegram() {
  const tg = (window as any).Telegram?.WebApp;

  return {
    tg,
    initData: tg?.initData || '',
    user: tg?.initData?.user || null,
    queryId: tg?.initData?.query_id || '',
    themeParams: tg?.themeParams || {}
  };
}
