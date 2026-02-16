import { List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';
import { Page } from '@/components/Page.tsx';

export const LaunchParamsPage: FC = () => {
  // Telegram WebApp functionality removed
  return (
    <Page>
      <List>
        <DisplayData
          rows={[
            { title: 'tgWebAppPlatform', value: 'N/A - WebApp Disabled' },
            { title: 'tgWebAppVersion', value: 'N/A - WebApp Disabled' },
            { title: 'tgWebAppStartParam', value: 'N/A - WebApp Disabled' },
            { title: 'tgWebAppData', type: 'link', value: '/init-data' },
            { title: 'tgWebAppThemeParams', type: 'link', value: '/theme-params' },
          ]}
        />
      </List>
    </Page>
  );
};
