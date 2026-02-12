import { useThemeParams } from '@tma.js/sdk-react';
import type { FC } from 'react';
import { List } from '@telegram-apps/telegram-ui';

import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';
import { Page } from '@/components/Page.tsx';

export const ThemeParamsPage: FC = () => {
  const themeParams = useThemeParams();

  return (
    <Page>
      <List>
        <DisplayData
          rows={
            Object
              .entries(themeParams || {})
              .map(([title, value]) => ({
                title: title
                  .replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
                  .replace(/background/, 'bg'),
                value: String(value),
              }))
          }
        />
      </List>
    </Page>
  );
};
