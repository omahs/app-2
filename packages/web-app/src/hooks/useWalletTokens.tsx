import {constants} from 'ethers';
import {Interface, getAddress, hexZeroPad} from 'ethers/lib/utils';
import {Log} from '@ethersproject/providers';
import {useState, useEffect} from 'react';

import {erc20TokenABI} from 'abis/erc20TokenABI';
import {isETH, fetchBalance} from 'utils/tokens';
import {HookData, TokenBalance} from 'utils/types';
import {useSigner} from 'use-signer';
import {useProviderWrapper} from './useProviderWrapper';

// TODO The two hooks in this file are very similar and should probably be
// merged into one. The reason I'm not doing it now is that I'm not sure if
// there is a situation where it makes sense have only the addresses. If that's
// not the case we should merge them. [VR 07-03-2022]

/**
 * Returns a list of token addresses for which the currently connected wallet
 * has balance.
 */
export function useUserTokenAddresses(): HookData<string[]> {
  const {address, provider} = useSigner();

  const [tokenList, setTokenList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    async function fetchTokenList() {
      setIsLoading(true);

      if (address && provider) {
        try {
          const erc20Interface = new Interface(erc20TokenABI);
          const latestBlockNumber = await provider.getBlockNumber();

          // Get all transfers sent to the input address
          const transfers: Log[] = await provider.getLogs({
            fromBlock: 0,
            toBlock: latestBlockNumber,
            topics: [
              erc20Interface.getEventTopic('Transfer'),
              null,
              hexZeroPad(address as string, 32),
            ],
          });
          // Filter unique token contract addresses and convert all events to Contract instances
          const tokens = await Promise.all(
            transfers
              .filter(
                (event, i) =>
                  i ===
                  transfers.findIndex(other => event.address === other.address)
              )
              .map(event => getAddress(event.address))
          );
          setTokenList(tokens);
        } catch (error) {
          setError(new Error('Failed to fetch ENS name'));
          console.error(error);
        }
      } else {
        setTokenList([]);
      }
      setIsLoading(false);
    }

    fetchTokenList();
  }, [address, provider]);

  return {data: tokenList, isLoading, error};
}

/**
 * Returns a list of token balances for the currently connected wallet.
 *
 * This is hook is very similar to useUserTokenAddresses, but in addition to the
 * contract address it also returns the user's balance for each of the tokens.
 */
export function useWalletTokens(): HookData<TokenBalance[]> {
  const {address, provider} = useSigner();
  const {balance} = useProviderWrapper(address, provider);
  const {
    data: tokenList,
    isLoading: tokenListLoading,
    error: tokenListError,
  } = useUserTokenAddresses();

  const [walletTokens, setWalletTokens] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  // fetch tokens and corresponding balance on wallet
  useEffect(() => {
    async function fetchWalletTokens() {
      setIsLoading(true);
      if (address === null || provider === null) {
        setWalletTokens([]);
        return;
      }

      if (Number(balance) !== -1 && Number(balance) !== 0)
        tokenList.push(constants.AddressZero);

      // get tokens balance from wallet
      const balances = await Promise.all(
        tokenList.map(address => {
          if (isETH(address)) return balance?.toString();
          else return fetchBalance(address, address, provider, false);
        })
      );

      // map tokens with their balance
      setWalletTokens(
        tokenList?.map((token, index) => ({
          address: token,
          count: balances[index],
        }))
      );
      setIsLoading(false);
    }

    if (tokenListLoading) return;
    if (tokenListError) {
      setError(tokenListError);
      return;
    }
    fetchWalletTokens();
  }, [address, balance, tokenList, provider, tokenListLoading, tokenListError]);

  return {data: walletTokens, isLoading: tokenListLoading || isLoading, error};
}
