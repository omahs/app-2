import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router} from 'react-router-dom';

import App from './app';
import {WalletProvider} from 'context/augmentedWallet';
import {APMProvider} from 'context/elasticAPM';
import {WalletMenuProvider} from 'context/walletMenu';
import {GlobalModalsProvider} from 'context/globalModals';
import {client} from 'context/apolloClient';
import 'tailwindcss/tailwind.css';
import {ProvidersProvider} from 'context/providers';
import {ApolloProvider} from '@apollo/client';

ReactDOM.render(
  <React.StrictMode>
    <APMProvider>
      <WalletProvider>
        <ProvidersProvider>
          <WalletMenuProvider>
            <GlobalModalsProvider>
              <Router>
                {/* By default, rinkeby client is chosen, each useQuery needs to pass the network client it needs as argument
                For REST queries using apollo, there's no need to pass a different client to useQuery  */}
                <ApolloProvider client={client['rinkeby']}>
                  <App />
                </ApolloProvider>
              </Router>
            </GlobalModalsProvider>
          </WalletMenuProvider>
        </ProvidersProvider>
      </WalletProvider>
    </APMProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
