import {
  IconCommunity,
  IconDashboard,
  IconFinance,
  IconGovernance,
} from '@aragon/ui-components';

import {i18n} from '../../i18n.config';
import {Dashboard, Community, Finance, Governance} from './paths';

export const BASE_URL = 'https://api.coingecko.com/api/v3';
export const DEFAULT_CURRENCY = 'usd';
export const INFURA_PROJECT_ID = '7a03fcb37be7479da06f92c5117afd47';

/** Time period options for token price change */
export const enum TimeFilter {
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
  // max = 'max',
}

export const NAV_LINKS = [
  {
    label: i18n.t('navLinks.dashboard'),
    path: Dashboard,
    icon: IconDashboard,
  },
  {
    label: i18n.t('navLinks.governance'),
    path: Governance,
    icon: IconGovernance,
  },
  {label: i18n.t('navLinks.finance'), path: Finance, icon: IconFinance},
  {
    label: i18n.t('navLinks.community'),
    path: Community,
    icon: IconCommunity,
  },
];

export const enum TransferTypes {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
}

export const URL_PATTERN =
  /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;

export const URL_WITH_PROTOCOL_PATTERN =
  /^(http:\/\/|https:\/\/)[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;

export const EMAIL_PATTERN =
  /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

type ChainMetaData = {
  [key: string]: {
    [key: number]: {
      id: number;
      name: string;
      rpc: string[];
      domain: string;
      logo: string;
      nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
      };
    };
  };
};

export const CHAIN_METADATA: ChainMetaData = {
  main: {
    42161: {
      id: 42161,
      name: 'Arbitrum One',
      rpc: ['https://arb1.arbitrum.io/rpc', 'wss://arb1.arbitrum.io/ws'],
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      domain: 'L2 Blockchain',
      logo: 'https://bridge.arbitrum.io/logo.png',
    },
    1: {
      id: 1,
      name: 'Ethereum',
      rpc: ['https://api.mycryptoapi.com/eth', 'https://cloudflare-eth.com'],
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      domain: 'L1 Blockchain',
      logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    },
    137: {
      id: 137,
      name: 'Polygon Mainnet',
      rpc: ['https://polygon-rpc.com/', 'https://rpc-mainnet.matic.network'],
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      domain: 'L2 Blockchain',
      logo: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
    },
  },
  test: {
    421611: {
      id: 421611,
      name: 'Arbitrum Rinkeby',
      rpc: ['https://rinkeby.arbitrum.io/rpc', 'wss://rinkeby.arbitrum.io/ws'],
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      domain: 'L2 Blockchain',
      logo: 'https://bridge.arbitrum.io/logo.png',
    },
    4: {
      id: 4,
      name: 'Rinkeby',
      rpc: [
        'https://rinkeby.infura.io/v3/${INFURA_API_KEY}',
        'wss://rinkeby.infura.io/ws/v3/${INFURA_API_KEY}',
      ],
      nativeCurrency: {
        name: 'Rinkeby Ether',
        symbol: 'RIN',
        decimals: 18,
      },
      domain: 'L1 Blockchain',
      logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    },
    80001: {
      id: 80001,
      name: 'Mumbai',
      rpc: [
        'https://matic-mumbai.chainstacklabs.com',
        'https://rpc-mumbai.maticvigil.com',
        'https://matic-testnet-archive-rpc.bwarelabs.com',
      ],
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      domain: 'L2 Blockchain',
      logo: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
    },
  },
};
