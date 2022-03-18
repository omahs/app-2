import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';

import App from './app';
import { WalletProvider } from 'context/augmentedWallet';
import { APMProvider } from 'context/elasticAPM';
import { WalletMenuProvider } from 'context/walletMenu';
import { GlobalModalsProvider } from 'context/globalModals';
import { ApolloClientProvider } from 'context/apolloClient';
import 'tailwindcss/tailwind.css';
import { ProvidersProvider } from 'context/providers';
import { UseSignerProvider } from 'use-signer';
import { UseCacheProvider } from 'hooks/useCache';
import { UseClientProvider } from 'hooks/useClient';

ReactDOM.render(
  <React.StrictMode>
    <APMProvider>
      <UseSignerProvider>
        <UseCacheProvider>
          <UseClientProvider>
            <WalletProvider>
              <ProvidersProvider>
                <WalletMenuProvider>
                  <GlobalModalsProvider>
                    <Router>
                      <ApolloClientProvider>
                        <App />
                      </ApolloClientProvider>
                    </Router>
                  </GlobalModalsProvider>
                </WalletMenuProvider>
              </ProvidersProvider>
            </WalletProvider>
          </UseClientProvider>
        </UseCacheProvider>
      </UseSignerProvider>
    </APMProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
