import {
  CHAIN_METADATA,
  SupportedNetworks,
  TransactionState,
} from 'utils/constants';
import {useQuery} from '@tanstack/react-query';

/**
 * Verify a smart contract on Etherscan using a custom React hook
 * @param contractAddress address of the smart contract to verify
 * @param network network where the smart contract is deployed
 * @returns Etherscan API response containing the smart contract's source code
 */
export const useValidateContractEtherscan = (
  contractAddress: string,
  network: SupportedNetworks,
  verificationState: TransactionState
) => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
  const url = `${CHAIN_METADATA[network].etherscanApi}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`;

  return useQuery({
    queryKey: ['verifyContractEtherscan', contractAddress, network],
    queryFn: () => {
      return fetch(url).then(res => res.json());
    },
    enabled: verificationState === TransactionState.LOADING && !!network,
  });
};

/**
 * Verify a smart contract on Sourcify using a custom React hook
 * @param contractAddress address of the smart contract to verify
 * @param network network where the smart contract is deployed
 * @returns Sourcify FullMatch API response containing the smart contract's source code
 */
export const useValidateContractFullMatchSourcify = (
  contractAddress: string,
  network: SupportedNetworks,
  verificationState: TransactionState
) => {
  const url = `https://repo.sourcify.dev/contracts/full_match/${CHAIN_METADATA[network].id}/${contractAddress}/metadata.json`;

  return useQuery({
    queryKey: ['verifyContractFullSourcify', contractAddress, network],
    queryFn: () => {
      return fetch(url).then(res => res.json());
    },
    enabled: verificationState === TransactionState.LOADING && !!network,
    retry: false,
  });
};

/**
 * Verify a smart contract on Sourcify using a custom React hook
 * @param contractAddress address of the smart contract to verify
 * @param network network where the smart contract is deployed
 * @returns Sourcify PartialMatch API response containing the smart contract's source code
 */
export const useValidateContractPartialMatchSourcify = (
  contractAddress: string,
  network: SupportedNetworks,
  verificationState: TransactionState
) => {
  const url = `https://repo.sourcify.dev/contracts/partial_match/${CHAIN_METADATA[network].id}/${contractAddress}/metadata.json`;

  return useQuery({
    queryKey: ['verifyContractPartialSourcify', contractAddress, network],
    queryFn: () => {
      return fetch(url).then(res => res.json());
    },
    enabled: verificationState === TransactionState.LOADING && !!network,
    retry: false,
  });
};

/**
 * Verify a smart contract on Etherscan using a custom React hook
 * @param contractAddress address of the smart contract to verify
 * @param network network where the smart contract is deployed
 * @returns Etherscan API response containing the smart contract's source code
 */
export const useValidateContract = (
  contractAddress: string,
  network: SupportedNetworks,
  verificationState: TransactionState
) => {
  const {data: etherscanVerifyData, isLoading: etherscanLoading} =
    useValidateContractEtherscan(contractAddress, network, verificationState);
  const {data: fullMatchSourcifyData, isLoading: sourcifyFullLoading} =
    useValidateContractFullMatchSourcify(
      contractAddress,
      network,
      verificationState
    );
  const {data: partialSourcifyData, isLoading: sourcifyPartialLoading} =
    useValidateContractPartialMatchSourcify(
      contractAddress,
      network,
      verificationState
    );

  return {
    sourcifyFullData: fullMatchSourcifyData,
    sourcifyPartialData: partialSourcifyData,
    etherscanData: etherscanVerifyData,
    sourcifyFullLoading,
    sourcifyPartialLoading,
    etherscanLoading,
  };
};
