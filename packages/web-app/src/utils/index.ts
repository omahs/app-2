import {utils} from 'ethers';

export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Switch Wallet chain
 */
export const switchWalletChain = async (newChainid: number) => {
  // Check if MetaMask is installed
  if (window.ethereum) {
    try {
      // check if the chain to connect to is installed
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{chainId: utils.hexlify(newChainid)}], // chainId must be in hexadecimal numbers
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      // if it is not, then install it into the user MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Arbitrum One',
                chainId: utils.hexlify(newChainid),
                rpcUrls: ['https://arb1.arbitrum.io/rpc'],
              },
            ],
          });
        } catch (addError) {
          console.error(addError);
        }
      }
      console.error(error);
    }
  } else {
    // if no window.ethereum then MetaMask is not installed
    alert(
      'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html'
    );
  }
};
