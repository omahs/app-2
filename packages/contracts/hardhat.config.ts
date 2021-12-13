import * as dotenv from "dotenv";

import { HardhatUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import 'hardhat-deploy'
import "hardhat-gas-reporter";
import 'hardhat-typechain'
import 'solidity-coverage'

dotenv.config();

const ETH_KEY = process.env.ETH_KEY
const accounts = ETH_KEY ? ETH_KEY.split(',') : []

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
      }
    }
  },
  namedAccounts: {
    deployer: 0,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY
  },
  defaultNetwork: 'hardhat',
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/78739e9ae61641ca87ad847790cf42de',
      accounts,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  }
};

export default config;
