import {JsonRpcSigner, Web3Provider} from '@ethersproject/providers';
// import {
//   useAccount,
//   useSigner,
//   useDisconnect,
//   useBalance,
//   useEnsName,
//   useEnsAvatar,
//   useNetwork as useWagmiNetwork,
// } from 'wagmi';
import {ethers, BigNumber} from 'ethers';
import WalletConnect from '@walletconnect/web3-provider';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA, infuraApiKey} from 'utils/constants';

import Web3Modal from 'web3modal';
// import WalletConnectProvider from '@walletconnect/web3-provider';
import {useEffect, useMemo, useState} from 'react';

export interface IUseWallet {
  balance: BigNumber | null;
  ensAvatarUrl: string;
  ensName: string;
  isConnected: boolean;
  isOnWrongNetwork: boolean;
  network: string;
  provider: Web3Provider | null;
  signer: JsonRpcSigner | null;
  status: 'connecting' | 'reconnecting' | 'connected' | 'disconnected';
  address: string | null;
  chainId: number;
  methods: {
    selectWallet: (
      cacheProvider?: boolean,
      networkId?: string
    ) => Promise<void>;
    disconnect: () => Promise<void>;
  };
}

const providerOptions = {
  walletconnect: {
    package: WalletConnect, // required
    options: {
      infuraId: infuraApiKey, // required
    },
  },
};

const web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions, // required
});

export const useWallet = (): IUseWallet => {
  const [provider, setProvider] = useState<Web3Provider>();
  const [web3ModalInstance, setWeb3ModalInstance] = useState<Web3Modal>();
  const [signer, setSigner] = useState<JsonRpcSigner>();
  const [address, setAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<IUseWallet['status']>('disconnected');
  const [chainId, setChainId] = useState<number>(1);
  const [network, setNetwork] = useState<string>('');
  const [balance, setBalance] = useState<BigNumber | null>(null);
  const [ensName, setEnsName] = useState<string>('');
  const [ensAvatarUrl, setEnsAvatarUrl] = useState<string>('');

  const isConnected = status === 'connected';

  const connectWallet = async () => {
    try {
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();

      console.log('check', instance, provider, signer, accounts, network);
      setProvider(provider);
      setNetwork(network.name);
      setSigner(signer);
      setWeb3ModalInstance(instance);
      if (accounts) setAddress(accounts[0]);
      setChainId(network.chainId);
    } catch (error) {
      console.log('er', error);
    }
  };

  console.log('test', status);

  const refreshState = () => {
    setAddress('');
    setProvider(undefined);
    setSigner(undefined);
    setWeb3ModalInstance(undefined);
    setNetwork('');
    setBalance(null);
    setEnsName('');
    setEnsAvatarUrl('');
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3Modal.cachedProvider]);

  // Update balance
  useEffect(() => {
    if (address && provider) {
      provider?.getBalance(address).then((newBalance: BigNumber) => {
        setBalance(newBalance);
      });
    }
  }, [provider, address]);

  // Update ENS name and avatar
  useEffect(() => {
    if (provider && address) {
      provider?.lookupAddress(address).then((name: string | null) => {
        name ? setEnsName(name) : setEnsName('');
      });
      provider?.getAvatar(address).then((avatarUrl: string | null) => {
        avatarUrl ? setEnsAvatarUrl(avatarUrl) : setEnsAvatarUrl('');
      });
    }
  }, [address, provider]);

  useEffect(() => {
    if (web3Modal?.on) {
      const handleAccountsConnected = (info: {chainId: number}) => {
        setStatus('connected');
        setChainId(info.chainId);
      };

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts) setAddress(accounts[0]);
      };

      const handleChainChanged = (_hexChainId: number) => {
        setChainId(_hexChainId);
      };

      web3Modal.on('connect', handleAccountsConnected);
      web3Modal.on('accountsChanged', handleAccountsChanged);
      web3Modal.on('chainChanged', handleChainChanged);

      return () => {
        if (web3Modal?.removeListener) {
          web3Modal.removeListener('accountsChanged', handleAccountsChanged);
          web3Modal.removeListener('chainChanged', handleChainChanged);
          web3Modal.removeListener('disconnect', handleDisconnect);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, web3ModalInstance]);

  // const provider = new ethers.providers.Web3Provider(instance);

  // const {data: signer} = useSigner();
  // const {chain} = useWagmiNetwork();
  // const {address, status: wagmiStatus, isConnected} = useAccount();
  // // const {disconnect} = useDisconnect();

  // const {data: wagmiBalance} = useBalance({
  //   address,
  // });

  // const {data: ensName} = useEnsName({
  //   address,
  // });

  // const {data: ensAvatarUrl} = useEnsAvatar({
  //   address,
  // });

  // const provider: Web3Provider = signer?.provider as Web3Provider;
  // const chainId: number = chain?.id || 0;
  // const balance: BigNumber | null = wagmiBalance?.value || null;
  // const isOnWrongNetwork: boolean =
  //   isConnected && CHAIN_METADATA[network].id !== chainId;

  const methods = {
    selectWallet: connectWallet,
    disconnect: async () => {
      await new Promise(() => {
        web3Modal.clearCachedProvider();
        refreshState();
        setStatus('disconnected');
      });
    },
  };

  return {
    provider: provider as Web3Provider,
    signer: signer as JsonRpcSigner,
    status,
    address,
    chainId,
    balance,
    ensAvatarUrl,
    ensName,
    isConnected,
    isOnWrongNetwork: false,
    methods,
    network,
  };
};
