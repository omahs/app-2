import {InfuraProvider, JsonRpcProvider} from '@ethersproject/providers';
import {BigNumber, providers as EthersProviders, ethers} from 'ethers';
import {isAddress, parseUnits} from 'ethers/lib/utils';
import {FieldError, FieldErrors, ValidateResult} from 'react-hook-form';
import {TFunction} from 'i18next';
import {TokenVotingClient} from '@aragon/sdk-client';

import {i18n} from '../../i18n.config';
import {ALPHA_NUMERIC_PATTERN, SupportedNetworks} from './constants';
import {
  Web3Address,
  getDefaultPayableAmountInputName,
  isOnlyWhitespace,
} from './library';
import {isERC1155, isERC20Token, isERC721} from './tokens';
import {
  Action,
  ActionAddAddress,
  ActionItem,
  ActionMintToken,
  ActionRemoveAddress,
  ActionSCC,
  ActionWithdraw,
  Nullable,
} from './types';
import {getEtherscanVerifiedContract} from 'services/etherscanAPI';

export type TokenType =
  | 'ERC-20'
  | 'governance-ERC20'
  | 'ERC-721'
  | 'ERC-1155'
  | 'Unknown'
  | undefined;

/**
 * Validate given token contract address
 *
 * @param address token contract address
 * @param provider rpc provider
 * @returns true when valid, or an error message when invalid
 */
export async function validateTokenAddress(
  address: string,
  provider: EthersProviders.Provider
): Promise<ValidateResult> {
  const result = validateAddress(address);

  if (result === true) {
    return (await isERC20Token(address, provider))
      ? true
      : (i18n.t('errors.notERC20Token') as string);
  } else {
    return result;
  }
}

/**
 * Validate given token contract address
 *
 * @param address token contract address
 * @param provider rpc provider
 * @returns true when valid, or an error message when invalid
 */
export async function validateGovernanceTokenAddress(
  address: string,
  provider: EthersProviders.Provider,
  pluginClient: TokenVotingClient
): Promise<{
  verificationResult: ValidateResult;
  type: string;
}> {
  const isAddress = validateAddress(address);

  if (isAddress !== true) {
    return {
      verificationResult: isAddress,
      type: 'Unknown',
    };
  } else {
    const isGovernanceCompatible =
      await pluginClient.methods.isTokenVotingCompatibleToken(address);

    // I should've used TokenVotingTokenCompatibility enum but It isn't exported
    if (isGovernanceCompatible === 'compatible')
      return {
        verificationResult: true,
        type: 'governance-ERC20',
      };
    else if (isGovernanceCompatible === 'needsWrapping')
      return {
        verificationResult: true,
        type: 'ERC-20',
      };
    else {
      const interfaces = await Promise.all([
        isERC721(address, provider),
        isERC1155(address, provider),
      ]);

      if (interfaces[1])
        return {
          verificationResult: true,
          type: 'ERC-1155',
        };
      else if (interfaces[0])
        return {
          verificationResult: true,
          type: 'ERC-721',
        };
      else {
        return {
          verificationResult: true,
          type: 'Unknown',
        };
      }
    }
  }
}

/**
 * Validate given token amount
 *
 * @param amount token amount
 * @param decimals token decimals
 * @param balance optional balance to verify against
 * @returns true when valid, or an error message when invalid
 */
export function validateTokenAmount(
  amount: string,
  decimals: number,
  balance = ''
) {
  // A token with no decimals (they do exist in the wild)
  if (!decimals) {
    return amount.includes('.')
      ? (i18n.t('errors.includeExactAmount') as string)
      : true;
  }

  // Number of characters after decimal point greater than
  // the number of decimals in the token itself
  if (amount.split('.')[1]?.length > decimals)
    return i18n.t('errors.exceedsFractionalParts', {decimals}) as string;

  // Amount less than or equal to zero
  if (BigNumber.from(parseUnits(amount, decimals)).lte(0))
    return i18n.t('errors.lteZero') as string;

  if (balance !== '') {
    if (BigNumber.from(parseUnits(amount, decimals)).gt(parseUnits(balance)))
      // Amount is greater than wallet/dao balance
      return i18n.t('errors.insufficientBalance') as string;
  }

  return true;
}

/**
 * Validate given wallet address
 *
 * @param address address to be validated
 * @returns true if valid, error message if invalid
 */
export const validateAddress = (address: string): ValidateResult => {
  return isAddress(address)
    ? true
    : (i18n.t('errors.invalidAddress') as string);
};

/**
 * Check if given string is a valid alpha-numeric string
 *
 * @param value value to be validated
 * @param field name of field to be validated
 * @returns true if valid, error message if invalid
 */
export const alphaNumericValidator = (
  value: string,
  field = 'Field'
): ValidateResult => {
  return new RegExp(ALPHA_NUMERIC_PATTERN).test(value)
    ? true
    : (i18n.t('errors.onlyAlphaNumeric', {field}) as string);
};

/**
 * Check if the proposal actions screen is valid
 * @param formActions List of actions from the form
 * @param contextActions List of actions from the ActionsContext
 * @param errors List of fields with errors
 * @returns Whether the screen is valid
 */
export async function actionsAreValid(
  formActions: Nullable<Action[]>,
  contextActions: ActionItem[],
  errors: FieldErrors,
  network: SupportedNetworks
) {
  // proposals can go through without any actions
  if (contextActions?.length === 0) return true;

  // mismatch between action form list and actions context
  if (contextActions.length !== formActions?.length) return false;

  let isValid = true;

  // @Sepehr might need to make affirmative instead at some point - F.F. 2022-08-18
  async function actionIsValid(index: number) {
    if (errors.actions) return true;
    switch (contextActions[index]?.name) {
      case 'withdraw_assets':
        return (
          (formActions?.[index] as ActionWithdraw)?.to.address !== '' &&
          (formActions?.[index] as ActionWithdraw)?.amount?.toString() !== '' &&
          (formActions?.[index] as ActionWithdraw)?.tokenAddress !== ''
        );
      case 'mint_tokens':
        return (
          formActions?.[index] as ActionMintToken
        )?.inputs?.mintTokensToWallets?.some(
          wallet =>
            wallet.web3Address.address !== '' && Number(wallet.amount) !== 0
        );

      // check that no address is empty; invalid addresses will be caught by
      // the form specific validator
      case 'add_address':
        return (
          formActions?.[index] as ActionRemoveAddress
        )?.inputs.memberWallets?.some(wallet => wallet.address !== '');

      //check whether an address is added to the action
      case 'remove_address':
        return (
          (formActions?.[index] as ActionAddAddress)?.inputs.memberWallets
            ?.length !== 0
        );
      case 'external_contract_action': {
        const SCCAction = formActions?.[index] as ActionSCC;
        const result = await validateSCCAction(SCCAction, network);
        return result;
      }
      default:
        return true;
    }
  }

  for (let i = 0; i < formActions?.length; i++) {
    isValid = await actionIsValid(i);
    if (isValid === false) {
      break;
    }
  }

  return isValid;
}

export async function validateSCCAction(
  SCCAction: ActionSCC,
  network: SupportedNetworks
) {
  const etherscanData = await getEtherscanVerifiedContract(
    SCCAction.contractAddress,
    network
  );

  if (
    etherscanData.status === '1' &&
    etherscanData.result[0].ABI !== 'Contract source code not verified'
  ) {
    // looping through selectedAction.inputs instead of the actionInputs
    // will allow us to ignore the payable input so that encoding using
    // the ABI does not complain
    const functionParams = SCCAction.inputs
      ?.filter(input => input.name !== getDefaultPayableAmountInputName(i18n.t))
      .map(input => {
        const param = input.value;

        if (typeof param === 'string' && param.indexOf('[') === 0) {
          return JSON.parse(param);
        }
        return param;
      });

    const iface = new ethers.utils.Interface(etherscanData.result[0].ABI);

    try {
      iface.encodeFunctionData(SCCAction.functionName, functionParams);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

export function isDaoEnsNameValid(
  value: string,
  provider: InfuraProvider | JsonRpcProvider,
  setError: (name: string, error: FieldError) => void,
  clearError: (name?: string | string[]) => void,
  getValues: (payload?: string | string[]) => Object
) {
  if (isOnlyWhitespace(value)) return i18n.t('errors.required.name');
  if (value.length > 128) return i18n.t('errors.ensNameLength');

  const pattern = /^[a-z0-9-]+$/;
  if (!pattern.test(value)) return i18n.t('errors.ensNameInvalidFormat');

  // some networks like Arbitrum Goerli and other L2s do not support ENS domains as of now
  // don't check and allow name collision failure to happen when trying to run transaction
  if (!provider.network.ensAddress) {
    console.warn(
      `Unable to verify DAO ens name: ${provider.network.name} does not support ENS domains`
    );
    return true;
  }

  // We might need to combine the method with setTimeout (Similar to useDebouncedState)
  // for better performance
  try {
    provider?.resolveName(`${value}.dao.eth`).then(result => {
      const inputValue = getValues('daoEnsName');
      // Check to see if the response belongs to current value
      if (value === inputValue) {
        if (result) {
          setError('daoEnsName', {
            type: 'validate',
            message: i18n.t('errors.ensDuplication'),
          });
        } else clearError();
      }
    });

    return i18n.t('infos.checkingEns');

    // clear errors will show the available message and enable the next button
  } catch (err) {
    return i18n.t('errors.ensNetworkIssue') as string;
  }
}

/**
 * Validates a web3Address
 * @param web3Address instance of Web3Address to validate
 * @param requiredErrorMessage error message to return when address is empty
 * @param t translation function
 * @returns true if address is valid and an error message if not
 */
export async function validateWeb3Address(
  web3Address: Web3Address,
  requiredErrorMessage: string,
  t: TFunction
): Promise<ValidateResult> {
  // empty field
  if (!web3Address.address && !web3Address.ensName) return requiredErrorMessage;

  // invalid ens
  if (web3Address.ensName && !web3Address.address)
    return (await web3Address.isValidEnsName())
      ? true
      : t('inputWallet.ensAlertCirtical');

  // invalid address
  if (web3Address.address && !web3Address.ensName)
    return web3Address.isAddressValid()
      ? true
      : t('inputWallet.addressAlertCritical');
}

/**
 * Determines if a given error value is present.
 * The function is designed to take either a standard `FieldError` from React Hook Form
 * or a custom error type and check if it's truthy.
 * In the context of form validation, the absence of an error (undefined) means the field is valid.
 *
 * @template T - The type of the custom error structure.
 * @param error - The error value to check.
 * @returns Returns true if the error is not present, otherwise false.
 */
export function isFieldValid<T>(error: FieldError | T | undefined): boolean {
  return !error;
}

export async function updateVerification(
  address: string,
  provider: EthersProviders.Provider
): Promise<ValidateResult> {
  const result = validateAddress(address);

  if (result === true) {
    return (await isERC20Token(address, provider))
      ? true
      : (i18n.t('errors.notERC20Token') as string);
  } else {
    return result;
  }
}
