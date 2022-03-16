import {Web3Provider} from '@ethersproject/providers';
import {BigNumber} from 'ethers';
import {useEffect, useState} from 'react';

export const useProviderWrapper = (
  address: string | null,
  provider: Web3Provider | null
) => {
  const [balance, setBalance] = useState<BigNumber>();
  const [networkName, setNetworkName] = useState('');
  useEffect(() => {
    if (address && provider) {
      provider.getBalance(address).then(balance => setBalance(balance));
      provider.getNetwork().then(network => setNetworkName(network.name));
    }
  }, [provider, address]);
  return {
    balance,
    networkName,
  };
};
