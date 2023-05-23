import {queryClient} from 'index';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';

export const getEtherscanVerifiedContract = (
  contractAddress: string,
  network: SupportedNetworks
) => {
  const apiKey = `${
    import.meta.env[CHAIN_METADATA[network].etherscanApiKeyName]
  }`;
  const url = `${CHAIN_METADATA[network].etherscanApi}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`;

  return queryClient.fetchQuery({
    queryKey: ['verifyContractEtherscan', contractAddress, network],
    staleTime: 3600000,
    queryFn: () => {
      return fetch(url).then(res => res.json());
    },
  });
};
