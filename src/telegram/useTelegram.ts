export function useTelegram() {
  // Telegram WebApp functionality completely removed
  return {
    tg: null,
    user: null,
    init: () => {
      console.warn('Telegram WebApp functionality has been removed');
    },
    isTelegramWebApp: false
  };
}
