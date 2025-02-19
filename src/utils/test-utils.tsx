import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {render} from '@testing-library/react';
import React from 'react';
import {I18nextProvider} from 'react-i18next';
import {HashRouter as Router} from 'react-router-dom';

import {WalletMenuProvider} from 'context/walletMenu';
import {i18n} from '../../i18n.config';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });

export function renderWithClient(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient();
  const {rerender, ...result} = render(
    <QueryClientProvider client={testQueryClient}>
      <AllProviders>{ui}</AllProviders>
    </QueryClientProvider>
  );
  return {
    ...result,
    rerender: (rerenderUi: React.ReactElement) =>
      rerender(
        <QueryClientProvider client={testQueryClient}>
          <AllProviders>{rerenderUi}</AllProviders>
        </QueryClientProvider>
      ),
  };
}

const AllProviders: React.FC = ({children}) => {
  return (
    <WalletMenuProvider>
      <I18nextProvider i18n={i18n}>
        <Router>{children}</Router>
      </I18nextProvider>
    </WalletMenuProvider>
  );
};

export * from '@testing-library/react';
export {renderWithClient as render};
