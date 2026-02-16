import { type FC, useMemo } from 'react';
import { List, Placeholder } from '@telegram-apps/telegram-ui';

import { DisplayData, type DisplayDataRow } from '@/components/DisplayData/DisplayData.tsx';
import { Page } from '@/components/Page.tsx';

function getUserRows(user: any): DisplayDataRow[] {
  return Object.entries(user).map(([title, value]) => ({ title, value: String(value) }));
}

export const InitDataPage: FC = () => {
  const tg = (window as any).Telegram?.WebApp;
  const initData = tg?.initData || '';
  const initDataUnsafe = tg?.initDataUnsafe || {};

  if (!initData) {
    return (
      <Page>
        <Placeholder
          header="Oops"
          description="Application was launched with missing init data"
        >
          <img
            alt="Telegram sticker"
            src="https://xelene.me/telegram.gif"
            style={{ display: 'block', width: '144px', height: '144px' }}
          />
        </Placeholder>
      </Page>
    );
  }

  const initDataRows = useMemo<DisplayDataRow[]>(() => {
    return [
      { title: 'raw', value: JSON.stringify(initData) },
      ...Object.entries(initData).reduce<DisplayDataRow[]>((acc, [title, value]) => {
        if (value instanceof Date) {
          acc.push({ title, value: value.toISOString() });
        } else if (!value || typeof value !== 'object') {
          acc.push({ title, value: String(value) });
        }
        return acc;
      }, []),
    ];
  }, [initData]);

  const userRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return initData.user
      ? getUserRows(initData.user)
      : undefined;
  }, [initData]);

  const receiverRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return initData.receiver
      ? getUserRows(initData.receiver)
      : undefined;
  }, [initData]);

  const chatRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return !initData.chat
      ? undefined
      : Object.entries(initData.chat).map(([title, value]) => ({ title, value: String(value) }));
  }, [initData]);

  return (
    <Page>
      <List>
        <DisplayData header={'Init Data'} rows={initDataRows}/>
        {userRows && <DisplayData header={'User'} rows={userRows}/>}
        {receiverRows && <DisplayData header={'Receiver'} rows={receiverRows}/>}
        {chatRows && <DisplayData header={'Chat'} rows={chatRows}/>}
      </List>
    </Page>
  );
};
