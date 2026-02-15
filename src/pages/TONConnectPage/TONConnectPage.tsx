import { useUtils } from '@tma.js/sdk-react';
import { useTonConnectUI } from '@/components/TonConnectUIContext';
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
  const tonConnectUI = useTonConnectUI();
  const utils = useUtils();

  return (
    <Page>
      <List>
        <Placeholder
          className={e('placeholder')}
          header="TON Connect"
          description={
            tonConnectUI.connected
              ? 'You are already connected'
              : 'To display the data related to the TON Connect, it is required to connect your wallet'
          }
          action={
            tonConnectUI.connected ? (
              <button 
                className={e('button-connected')}
                onClick={() => tonConnectUI.disconnect()}
              >
                Disconnect
              </button>
            ) : (
              <button 
                className={e('button')}
                onClick={() => tonConnectUI.openModal()}
              >
                Connect Wallet
              </button>
            )
          }
        >
          <Avatar
            size={96}
            src={
              tonConnectUI.connected
                ? tonConnectUI.wallet.imageUrl
                : 'https://avatars.githubusercontent.com/u'
            }
          />
        </Placeholder>
      </List>

      {tonConnectUI.connected && (
        <Section header="Wallet">
          <Cell
            subtitle={tonConnectUI.wallet.name}
            after={<Navigation>About wallet</Navigation>}
            onClick={(e) => {
              e.preventDefault();
              utils.openLink(tonConnectUI.wallet.aboutUrl);
            }}
          >
            <Title level="3">{tonConnectUI.wallet.name}</Title>
          </Cell>
          <Cell subtitle="Connection status">
            Connected
          </Cell>
          <Cell subtitle="Wallet address">
            {tonConnectUI.wallet.account.address}
          </Cell>
        </Section>
      )}
    </Page>
  );
};
