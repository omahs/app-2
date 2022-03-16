import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router} from 'react-router-dom';

import App from './app';
import {WalletProvider} from 'context/augmentedWallet';
import {APMProvider} from 'context/elasticAPM';
import {WalletMenuProvider} from 'context/walletMenu';
import {GlobalModalsProvider} from 'context/globalModals';
import {ApolloClientProvider} from 'context/apolloClient';
import 'tailwindcss/tailwind.css';
import {ProvidersProvider} from 'context/providers';
import {IProviderOptions} from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import {UseSignerProvider} from 'use-signer';
// import { UseSignerProvider } from 'hooks/useSigner';

// Web3Modal settings
const providerOptions: IProviderOptions = {
  // metamask: {}
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: 'mainnet.eth.aragon.network',
    },
  },
  // fortmatic: {
  //   package: Fortmatic, // required
  //   options: {
  //     key: BUILD.fortmaticKey,
  //     network: customNetworkOptions, // if we don't pass it, it will default to localhost:8454
  //   },
  // },
};
ReactDOM.render(
  <React.StrictMode>
    <APMProvider>
      <WalletProvider>
        <UseSignerProvider providerOptions={providerOptions}>
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
        </UseSignerProvider>
      </WalletProvider>
    </APMProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
