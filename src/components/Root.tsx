import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { getTonConnectUI } from '@/lib/tonConnect';

import { App } from '@/components/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';

function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div>
      <p>An unhandled error occurred:</p>
      <blockquote>
        <code>
          {error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : JSON.stringify(error)}
        </code>
      </blockquote>
    </div>
  );
}

export function Root() {
  const tonConnectUI = getTonConnectUI();
  
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      {tonConnectUI ? (
        <TonConnectUIProvider tonConnectUI={tonConnectUI}>
          <App/>
        </TonConnectUIProvider>
      ) : (
        <App/>
      )}
    </ErrorBoundary>
  );
}
