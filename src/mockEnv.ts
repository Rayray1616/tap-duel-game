// It is important, to mock the environment only for development purposes. When building the
// application, import.meta.env.DEV will become false, and the code inside will be tree-shaken,
// so you will not see it in your final bundle.
if (import.meta.env.DEV) {
  // Check if we're in Telegram WebApp environment
  const isTelegramWebApp = typeof window !== 'undefined' && (window as any).Telegram?.WebApp;
  
  // Only mock if we're not in Telegram or if Telegram WebApp is not properly initialized
  if (!isTelegramWebApp || !(window as any).Telegram.WebApp.initData) {
    const themeParams = {
      accent_text_color: '#6ab2f2',
      bg_color: '#17212b',
      button_color: '#5288c1',
      button_text_color: '#ffffff',
      destructive_text_color: '#ec3942',
      header_bg_color: '#17212b',
      hint_color: '#708499',
      link_color: '#6ab3f3',
      secondary_bg_color: '#232e3c',
      section_bg_color: '#17212b',
      section_header_text_color: '#6ab3f3',
      subtitle_text_color: '#708499',
      text_color: '#f5f5f5',
    };

    // Mock Telegram WebApp object
    if (typeof window !== 'undefined' && !(window as any).Telegram) {
      (window as any).Telegram = {
        WebApp: {
          themeParams,
          initData: '',
          initDataUnsafe: {},
          version: '8.4',
          platform: 'tdesktop',
          ready: () => {},
          expand: () => {},
          close: () => {},
          enableClosingConfirmation: () => {},
          disableVerticalSwipe: () => {},
          setHeaderColor: () => {},
          setBackgroundColor: () => {},
          MainButton: {
            text: '',
            color: '#5288c1',
            textColor: '#ffffff',
            isVisible: false,
            isActive: false,
            onClick: null,
            offClick: null,
            show: () => {},
            hide: () => {},
            enable: () => {},
            disable: () => {},
            setText: () => {},
          },
          BackButton: {
            isVisible: false,
            onClick: null,
            offClick: null,
            show: () => {},
            hide: () => {},
          },
          HapticFeedback: {
            impactOccurred: () => {},
            notificationOccurred: () => {},
            selectionChanged: () => {},
          },
        }
      };
    }

    console.info(
      '⚠️ As long as the current environment was not considered as the Telegram-based one, it was mocked. Take a note, that you should not do it in production and current behavior is only specific to the development process. Environment mocking is also applied only in development mode. So, after building the application, you will not see this behavior and related warning, leading to crashing the application outside Telegram.',
    );
  } else {
    console.info(
      '✅ Running in Telegram WebApp environment with valid initData - no mocking needed',
    );
  }
}
