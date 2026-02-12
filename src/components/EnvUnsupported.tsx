import { Placeholder, AppRoot } from '@telegram-apps/telegram-ui';
import { useMemo } from 'react';

export function EnvUnsupported() {
  const [platform, isDark] = useMemo(() => {
    // Default fallback values when not in Telegram
    return ['android', false];
  }, []);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(platform) ? 'ios' : 'base'}
    >
      <Placeholder
        header="Oops"
        description="You are using too old Telegram client to run this application"
      >
        <img
          alt="Telegram sticker"
          src="https://xelene.me/telegram.gif"
          style={{ display: 'block', width: '144px', height: '144px' }}
        />
      </Placeholder>
    </AppRoot>
  );
}