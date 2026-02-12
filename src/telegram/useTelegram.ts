export function useTelegram() {
  const tg = (window as any).Telegram?.WebApp;

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    init: () => {
      tg?.expand();
      tg?.disableVerticalSwipe();
      tg?.enableClosingConfirmation();
    }
  };
}
