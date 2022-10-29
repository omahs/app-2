import {Address} from '@aragon/ui-components/dist/utils/addresses';
import {TransactionDescription} from 'ethers/lib/utils';
import {ethers} from 'ethers';
import {MinimalTransactionInput} from 'utils/types';

type FetchedContractABI = Promise<string | undefined>;
async function fetchContractABI(contractAddress: Address): FetchedContractABI {
  if (!contractAddress) return;
  
  const etherscanKey = '';
  const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${etherscanKey}`
  
  try {
    const res = await fetch(url);
    const parsedResponse = await res.json();
    return parsedResponse['result'];
  } catch (error) {
    console.error('Error fetching contract ABI', error);
  }
}

async function decodeTransactionInputs(transaction: MinimalTransactionInput): Promise<TransactionDescription | undefined> {
  try {
    const abi = await fetchContractABI(transaction.to);
    if (!abi) return;
    console.log('The abi is: ', abi)
    const iface = new ethers.utils.Interface(abi);
    return iface.parseTransaction({data: transaction.data, value: transaction.value});
  } catch (error) {
    console.log('Error fetching the ABI: ', error)
    return;
  }
}

export {decodeTransactionInputs};
