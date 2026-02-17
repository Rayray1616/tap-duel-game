export function useTelegram() {
  const tg = (window as any).Telegram?.WebApp;

  return {
    tg,
    user: tg?.initDataUnsafe?.user || null,
    initData: tg?.initData || "",
    isTelegram: Boolean(tg),
  };
}
