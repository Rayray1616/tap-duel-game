import { useTonMiniApp } from '@/components/TonMiniAppContext';
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
  const tonConnect = useTonMiniApp();

  return (
    <Page>
      <List>
        <Placeholder
          header="TON Connect"
          description={
            tonConnect.connected
              ? 'You are already connected'
              : 'To display the data related to the TON Connect, it is required to connect your wallet'
          }
          action={
            tonConnect.connected ? (
              <button 
                className={e('button-connected')}
                onClick={() => tonConnect.disconnect()}
              >
                Disconnect
              </button>
            ) : (
              <button 
                className={e('button')}
                onClick={() => tonConnect.connect()}
              >
                Connect Wallet
              </button>
            )
          }
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              backgroundColor: tonConnect.connected ? '#0088cc' : '#ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px'
            }}
          >
            {tonConnect.connected ? '✓' : '?'}
          </div>
        </Placeholder>
      </List>

      {tonConnect.connected && (
        <Section header="Wallet">
          <Cell subtitle="Connection status">
            Connected
          </Cell>
          <Cell subtitle="Wallet address">
            {tonConnect.account.address}
          </Cell>
        </Section>
      )}
    </Page>
  );
};
