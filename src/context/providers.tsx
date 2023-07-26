import {
  AlchemyProvider,
  InfuraProvider,
  JsonRpcProvider,
  Web3Provider,
} from '@ethersproject/providers';
import React, {createContext, useContext, useEffect, useState} from 'react';

import {
  LIVE_CONTRACTS,
  SupportedNetwork as sdkSupportedNetworks,
} from '@aragon/sdk-client-common';
import {useWallet} from 'hooks/useWallet';
import {
  alchemyApiKeys,
  CHAIN_METADATA,
  getSupportedNetworkByChainId,
  infuraApiKey,
  SupportedChainID,
  SupportedNetworks,
} from 'utils/constants';
import {Nullable} from 'utils/types';
import {useNetwork} from './network';
import {translateToNetworkishName} from 'utils/library';

const NW_ARB = {chainId: 42161, name: 'arbitrum'};
const NW_ARB_GOERLI = {chainId: 421613, name: 'arbitrum-goerli'};

/* CONTEXT PROVIDER ========================================================= */

type Providers = {
  infura: JsonRpcProvider;
  web3: Nullable<Web3Provider>;
};

const ProviderContext = createContext<Nullable<Providers>>(null);

type ProviderProviderProps = {
  children: React.ReactNode;
};

/**
 * Returns two blockchain providers.
 *
 * The infura provider is always available, regardless of whether or not a
 * wallet is connected.
 *
 * The web3 provider, however, is based on the connected and wallet and will
 * therefore be null if no wallet is connected.
 */
export function ProvidersProvider({children}: ProviderProviderProps) {
  const {provider} = useWallet();
  const {network} = useNetwork();

  const specificProvider = useSpecificProvider(CHAIN_METADATA[network].id);

  return (
    <ProviderContext.Provider
      // TODO: remove casting once useSigner has updated its version of the ethers library
      value={{
        infura: specificProvider,
        web3: (provider as Web3Provider) || null,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

function getInfuraProvider(network: SupportedNetworks) {
  // NOTE Passing the chainIds from useWallet doesn't work in the case of
  // arbitrum and arbitrum-goerli. They need to be passed as objects.
  // However, I have no idea why this is necessary. Looking at the ethers
  // library, there's no reason why passing the chainId wouldn't work. Also,
  // I've tried it on a fresh project and had no problems there...
  // [VR 07-03-2022]
  if (network === 'arbitrum') {
    return new InfuraProvider(NW_ARB, infuraApiKey);
  } else if (network === 'arbitrum-test') {
    return new InfuraProvider(NW_ARB_GOERLI, infuraApiKey);
  } else if (network === 'base') {
    console.warn(`Infura does not support '${network}' network.`);
    return null;
  } else if (network === 'mumbai' || network === 'polygon') {
    return new JsonRpcProvider(CHAIN_METADATA[network].rpc[0], {
      chainId: CHAIN_METADATA[network].id,
      name: translateToNetworkishName(network),
      ensAddress:
        LIVE_CONTRACTS[
          translateToNetworkishName(network) as sdkSupportedNetworks
        ].ensRegistry,
    });
  } else {
    return new InfuraProvider(CHAIN_METADATA[network].id, infuraApiKey);
  }
}

/**
 * Returns an AlchemyProvider instance for the given chain ID
 * or null if the API key is not available.
 * @param chainId - The numeric chain ID associated with the desired network.
 * @returns An AlchemyProvider instance for the specified network or null if the API key is not found.
 */
export function getAlchemyProvider(chainId: number): AlchemyProvider | null {
  const network = getSupportedNetworkByChainId(chainId) as SupportedNetworks;
  const apiKey = alchemyApiKeys[network];
  const translatedNetwork = translateToNetworkishName(network);

  return apiKey && translatedNetwork !== 'unsupported'
    ? new AlchemyProvider(translatedNetwork, apiKey)
    : null;
}

/**
 * Creates a JSON-RPC provider for the given chain ID or network.
 * Note: This is mostly intended for Base networks not supported by Alchemy and Infura
 * @param {SupportedChainID | SupportedNetworks} chainIdOrNetwork - The chain ID or network to create the provider for.
 * @returns {JsonRpcProvider | null} The JSON-RPC provider instance or null if the chain or network is unsupported.
 */
export function getJsonRpcProvider(
  chainIdOrNetwork: SupportedChainID | SupportedNetworks
): JsonRpcProvider | null {
  // chainIdOrNetwork is a network if it is a string;
  // get the associating network it if it is an ID instead
  const network =
    typeof chainIdOrNetwork === 'string'
      ? chainIdOrNetwork
      : getSupportedNetworkByChainId(chainIdOrNetwork);

  // return null if the network is not supported or cannot be determined.
  if (!network || network === 'unsupported') {
    return null;
  }

  // translate to networkish
  const networkish = translateToNetworkishName(network) as sdkSupportedNetworks;

  return new JsonRpcProvider(CHAIN_METADATA[network]?.rpc?.[0], {
    chainId: CHAIN_METADATA[network]?.id,
    name: networkish,
    ensAddress: LIVE_CONTRACTS[networkish]?.ensRegistry,
  });
}

/**
 * Returns provider based on the given chain id
 * @param chainId network chain is
 * @returns infura provider or JSON-RPC provider
 */
export function useSpecificProvider(
  chainId: SupportedChainID
): JsonRpcProvider {
  const network = getSupportedNetworkByChainId(chainId) as SupportedNetworks;

  const [provider, setProvider] = useState(() =>
    network === 'base'
      ? (getJsonRpcProvider(network) as JsonRpcProvider)
      : (getInfuraProvider(network) as JsonRpcProvider)
  );

  useEffect(() => {
    setProvider(
      network === 'base'
        ? (getJsonRpcProvider(network) as JsonRpcProvider)
        : (getInfuraProvider(network) as JsonRpcProvider)
    );
  }, [chainId, network]);

  return provider;
}

/* CONTEXT CONSUMER ========================================================= */

export function useProviders(): NonNullable<Providers> {
  return useContext(ProviderContext) as Providers;
}
