import {ApolloProvider} from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router} from 'react-router-dom';
import 'tailwindcss/tailwind.css';

import {AlertProvider} from 'context/alert';
import {client, goerliClient} from 'context/apolloClient';
import {APMProvider} from 'context/elasticAPM';
import {GlobalModalsProvider} from 'context/globalModals';
import {NetworkProvider} from 'context/network';
import {PrivacyContextProvider} from 'context/privacyContext';
import {ProvidersProvider} from 'context/providers';
import {TransactionDetailProvider} from 'context/transactionDetail';
import {WalletMenuProvider} from 'context/walletMenu';
import {UseCacheProvider} from 'hooks/useCache';
import {UseClientProvider} from 'hooks/useClient';
// import {infuraApiKey, walletConnectProjectID} from 'utils/constants';
// import {WalletConnectLegacyConnector} from 'wagmi/connectors/walletConnectLegacy';

// import Web3Modal from 'web3modal';
// import WalletConnectProvider from '@walletconnect/web3-provider';
// import {configureChains, createClient, mainnet, WagmiConfig} from 'wagmi';
// import {goerli} from 'wagmi/chains';
// import {LedgerConnector} from '@wagmi/connectors/ledger';
// import {infuraProvider} from 'wagmi/providers/infura';

import App from './app';
import {ethers} from 'ethers';

// // Wagmi client
// const {provider} = configureChains(chains, [
//   walletConnectProvider({projectId: walletConnectProjectID}),
//   infuraProvider({apiKey: infuraApiKey}),
// ]);

// const wagmiClient = createClient({
//   autoConnect: true,
//   provider,
// });

// // Web3Modal Ethereum Client
// const ethereumClient = new EthereumClient(wagmiClient, chains);

const CACHE_VERSION = 1;
const onLoad = () => {
  // Wipe local storage cache if its structure is out of date and clashes
  // with this version of the app.
  const cacheVersion = localStorage.getItem('AragonCacheVersion');
  const retainKeys = ['privacy-policy-preferences', 'favoriteDaos'];
  if (!cacheVersion || parseInt(cacheVersion) < CACHE_VERSION) {
    for (let i = 0; i < localStorage.length; i++) {
      if (!retainKeys.includes(localStorage.key(i)!)) {
        localStorage.removeItem(localStorage.key(i)!);
      }
    }
    localStorage.setItem('AragonCacheVersion', CACHE_VERSION.toString());
  }
};
onLoad();

ReactDOM.render(
  <>
    <React.StrictMode>
      <PrivacyContextProvider>
        <APMProvider>
          <Router>
            <AlertProvider>
              {/* <WagmiConfig client={wagmiClient}> */}
              <NetworkProvider>
                <UseClientProvider>
                  <UseCacheProvider>
                    <ProvidersProvider>
                      <TransactionDetailProvider>
                        <WalletMenuProvider>
                          <GlobalModalsProvider>
                            {/* By default, goerli client is chosen, each useQuery needs to pass the network client it needs as argument
                      For REST queries using apollo, there's no need to pass a different client to useQuery  */}
                            <ApolloProvider
                              client={client['goerli'] || goerliClient} //TODO remove fallback when all clients are defined
                            >
                              <App />
                            </ApolloProvider>
                          </GlobalModalsProvider>
                        </WalletMenuProvider>
                      </TransactionDetailProvider>
                    </ProvidersProvider>
                  </UseCacheProvider>
                </UseClientProvider>
              </NetworkProvider>
              {/* </WagmiConfig> */}
            </AlertProvider>
          </Router>
        </APMProvider>
      </PrivacyContextProvider>
    </React.StrictMode>
  </>,
  document.getElementById('root')
);
