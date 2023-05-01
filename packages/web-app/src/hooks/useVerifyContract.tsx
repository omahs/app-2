import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {useQuery} from '@tanstack/react-query';

/**
 * Verify a smart contract on Etherscan using a custom React hook
 * @param contractAddress address of the smart contract to verify
 * @param network network where the smart contract is deployed
 * @returns Etherscan API response containing the smart contract's source code
 */
export const useVerifyContractEtherscan = (
  contractAddress: string | undefined,
  network: SupportedNetworks
) => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
  const url = `${CHAIN_METADATA[network].etherscanApi}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`;

  return useQuery({
    queryKey: ['verifyContractEtherscan', contractAddress, network],
    queryFn: () => {
      return fetch(url).then(res => res.json());
    },
    enabled: !!contractAddress && !!network,
  });
};

/**
 * Verify a smart contract on Sourcify using a custom React hook
 * @param contractAddress address of the smart contract to verify
 * @param network network where the smart contract is deployed
 * @returns Sourcify FullMatch API response containing the smart contract's source code
 */
export const useVerifyContractFullMatchSourcify = (
  contractAddress: string | undefined,
  network: SupportedNetworks
) => {
  const url = `https://sourcify.dev/server/check-by-addresses?addresses=${contractAddress}&chainIds=${CHAIN_METADATA[network].id}`;

  return useQuery({
    queryKey: ['verifyContractFullSourcify', contractAddress, network],
    queryFn: () => {
      return fetch(url).then(res => res.json());
    },
    enabled: !!contractAddress && !!network,
  });
};

/**
 * Verify a smart contract on Sourcify using a custom React hook
 * @param contractAddress address of the smart contract to verify
 * @param network network where the smart contract is deployed
 * @returns Sourcify PartialMatch API response containing the smart contract's source code
 */
export const useVerifyContractPartialMatchSourcify = (
  contractAddress: string | undefined,
  network: SupportedNetworks
) => {
  const url = `https://sourcify.dev/server/check-by-all-addresses?addresses=${contractAddress}&chainIds=${CHAIN_METADATA[network].id}`;

  return useQuery({
    queryKey: ['verifyContractPartialSourcify', contractAddress, network],
    queryFn: () => {
      return fetch(url).then(res => res.json());
    },
    enabled: !!contractAddress && !!network,
  });
};

/**
 * Verify a smart contract on Etherscan using a custom React hook
 * @param contractAddress address of the smart contract to verify
 * @param network network where the smart contract is deployed
 * @returns Etherscan API response containing the smart contract's source code
 */
export const useVerifyContract = (
  contractAddress: string | undefined,
  network: SupportedNetworks
) => {
  const {data: etherscanVerifyData, isLoading: etherscanLoading} =
    useVerifyContractEtherscan(contractAddress, network);
  const {data: fullMatchSourcifyData, isLoading: sourcifyFullLoading} =
    useVerifyContractFullMatchSourcify(contractAddress, network);
  const {data: partialSourcifyData, isLoading: sourcifyPartialLoading} =
    useVerifyContractPartialMatchSourcify(contractAddress, network);

  return {
    sourcifyFullData: fullMatchSourcifyData,
    sourcifyPartialData: partialSourcifyData,
    etherscanData: etherscanVerifyData,
    sourcifyFullLoading,
    sourcifyPartialLoading,
    etherscanLoading,
  };
};
