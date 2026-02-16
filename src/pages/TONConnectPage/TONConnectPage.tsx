import {
  Cell,
  List,
  Navigation,
  Placeholder,
  Section,
  Title,
} from '@telegram-apps/telegram-ui';

import { FC } from 'react';
import { Page } from '@/components/Page.tsx';
import { bem } from '@/css/bem.ts';

import './TONConnectPage.css';

const [, e] = bem('ton-connect-page');

export const TONConnectPage: FC = () => {
  // TON Connect functionality removed

  return (
    <Page>
      <List>
        <Placeholder
          header="TON Connect"
          description="TON Connect functionality has been removed from this application"
          action={
            <button 
              className={e('button')}
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              Connect Unavailable
            </button>
          }
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              backgroundColor: '#ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '24px'
            }}
          >
            🚫
          </div>
        </Placeholder>
      </List>

      <Section header="Wallet Status">
        <Cell subtitle="Connection status">
          Not Connected
        </Cell>
        <Cell subtitle="Wallet address">
          No wallet available
        </Cell>
      </Section>
    </Page>
  );
};
