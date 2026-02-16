import { List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';
import { Page } from '@/components/Page.tsx';

export const LaunchParamsPage: FC = () => {
  const tg = (window as any).Telegram?.WebApp;

  return (
    <Page>
      <List>
        <DisplayData
          rows={[
            { title: 'tgWebAppPlatform', value: tg?.platform || '' },
            { title: 'tgWebAppVersion', value: tg?.version || '' },
            { title: 'tgWebAppStartParam', value: tg?.initData?.start_param || '' },
            { title: 'tgWebAppData', type: 'link', value: '/init-data' },
            { title: 'tgWebAppThemeParams', type: 'link', value: '/theme-params' },
          ]}
        />
      </List>
    </Page>
  );
};
