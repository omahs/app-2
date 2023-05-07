import {
  AlertInline,
  ButtonText,
  IconChevronRight,
  IconRadioCancel,
  IconReload,
  IconSuccess,
  Link,
  Spinner,
  WalletInput,
  shortenAddress,
} from '@aragon/ui-components';
import {isAddress} from 'ethers/lib/utils';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useAlertContext} from 'context/alert';
import {useNetwork} from 'context/network';
import {useWallet} from 'hooks/useWallet';
import {SccFormData} from 'containers/smartContractComposer';
import {addVerifiedSmartContract} from 'services/cache';
import {CHAIN_METADATA, TransactionState} from 'utils/constants';
import {handleClipboardActions} from 'utils/library';
import {
  EtherscanContractResponse,
  SmartContract,
  SourcifyContractResponse,
} from 'utils/types';
import ModalHeader from './modalHeader';
import {useValidateContract} from 'hooks/useValidateContract';
import {fetchTokenData} from 'services/prices';
import {useApolloClient} from '@apollo/client';
import {getTokenInfo} from 'utils/tokens';
import {useProviders} from 'context/providers';
import {useQueryClient} from '@tanstack/react-query';

type AugmentedEtherscanContractResponse = EtherscanContractResponse &
  SourcifyContractResponse & {
    logo?: string;
  };

type Props = {
  isOpen: boolean;
  onVerificationSuccess: () => void;
  onClose: () => void;
  onBackButtonClicked: () => void;
};

const icons = {
  [TransactionState.WAITING]: undefined,
  [TransactionState.LOADING]: undefined,
  [TransactionState.SUCCESS]: <IconChevronRight />,
  [TransactionState.ERROR]: <IconReload />,
};

// not exactly sure where opening will be happen or if
// these modals will be global modals. For now, keeping
// this as a "controlled" component
const ContractAddressValidation: React.FC<Props> = props => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const client = useApolloClient();
  const {address} = useWallet();
  const {network} = useNetwork();
  const {infura: provider} = useProviders();
  const queryClient = useQueryClient();

  const {control, resetField, setValue, setError} =
    useFormContext<SccFormData>();
  const {errors} = useFormState({control});
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [addressField, contracts] = useWatch({
    name: ['contractAddress', 'contracts'],
    control,
  });
  const [verificationState, setVerificationState] = useState<TransactionState>(
    TransactionState.WAITING
  );
  const [contractName, setContractName] = useState<string | undefined>();

  const {
    sourcifyFullData,
    sourcifyPartialData,
    etherscanData,
    sourcifyLoading,
    etherscanLoading,
  } = useValidateContract(addressField, network, verificationState);

  const isTransactionSuccessful =
    verificationState === TransactionState.SUCCESS;
  const isTransactionLoading = verificationState === TransactionState.LOADING;
  const isTransactionWaiting = verificationState === TransactionState.WAITING;

  const setVerifiedContract = useCallback(
    (type: string, value: AugmentedEtherscanContractResponse, logo: string) => {
      if (value) {
        setVerificationState(TransactionState.SUCCESS);
        let verifiedContract = {} as SmartContract;

        if (type === 'sourcifyMatch') {
          verifiedContract = {
            actions: value.output?.abi,
            address: addressField,
            name: value.output.devdoc.title,
            logo,
          };
          setContractName(value.output.devdoc.title as string);
        } else {
          verifiedContract = {
            actions: JSON.parse(etherscanData?.result[0].ABI || ''),
            address: addressField,
            name: etherscanData?.result[0].ContractName,
            logo,
          };
          setContractName(etherscanData?.result[0].ContractName);
        }

        setValue('contracts', [...contracts, verifiedContract]);

        // add to storage
        addVerifiedSmartContract(
          verifiedContract,
          address,
          CHAIN_METADATA[network].id
        );
      } else {
        setVerificationState(TransactionState.WAITING);
        setError('contractAddress', {
          type: 'validate',
          message: t('errors.notValidContractAddress'),
        });
      }
    },
    [
      address,
      addressField,
      contracts,
      etherscanData?.result,
      network,
      setError,
      setValue,
      t,
    ]
  );

  useEffect(() => {
    async function setData() {
      if (!sourcifyLoading && !etherscanLoading && isTransactionLoading) {
        // fetch smart contract logo
        const tokenData = await getTokenInfo(
          addressField,
          provider,
          CHAIN_METADATA[network].nativeCurrency
        ).then(value => {
          return fetchTokenData(addressField, client, network, value.symbol);
        });

        setVerificationState(TransactionState.SUCCESS);

        //prioritize sourcify over etherscan if sourcify data is available
        if (sourcifyFullData || sourcifyPartialData) {
          setVerifiedContract(
            'sourcifyMatch',
            sourcifyFullData || sourcifyPartialData,
            tokenData?.imgUrl || ''
          );
        } else if (
          etherscanData.result[0].ABI !== 'Contract source code not verified'
        ) {
          setVerifiedContract(
            'etherscanMatch',
            etherscanData,
            tokenData?.imgUrl || ''
          );
        } else {
          setVerificationState(TransactionState.WAITING);
          setError('contractAddress', {
            type: 'validate',
            message: t('errors.notValidContractAddress'),
          });
        }
      }
    }

    setData();
  }, [
    addressField,
    client,
    etherscanData,
    etherscanLoading,
    isTransactionLoading,
    network,
    provider,
    setError,
    setVerifiedContract,
    sourcifyFullData,
    sourcifyLoading,
    sourcifyPartialData,
    t,
  ]);

  const label = {
    [TransactionState.WAITING]: t('scc.validation.ctaLabelWaiting'),
    [TransactionState.LOADING]: '',
    [TransactionState.SUCCESS]: t('scc.validation.ctaLabelSuccess'),
    [TransactionState.ERROR]: '',
  };

  // clear field when there is a value, else paste
  const handleAdornmentClick = useCallback(
    (value: string, onChange: (value: string) => void) => {
      // when there is a value clear it
      if (value && !isTransactionSuccessful && !isTransactionLoading) {
        onChange('');
        alert(t('alert.chip.inputCleared'));
      } else handleClipboardActions(value, onChange, alert);
    },
    [alert, isTransactionLoading, isTransactionSuccessful, t]
  );

  const addressValidator = (value: string) => {
    // duplication: contract already connected
    const addressExists = contracts.some(
      c => c.address.toLowerCase() === value.toLowerCase()
    );

    if (addressExists) return t('errors.duplicateContractAddress');

    // check if address is valid address string
    if (isAddress(value)) return true;
    else return t('errors.invalidAddress');
  };

  const adornmentText = useMemo(() => {
    if (isTransactionSuccessful || isTransactionLoading)
      return t('labels.copy');
    if (addressField !== '') return t('labels.clear');
    return t('labels.paste');
  }, [addressField, isTransactionLoading, isTransactionSuccessful, t]);

  const isButtonDisabled = useMemo(
    () => errors.contractAddress !== undefined,
    [errors.contractAddress]
  );

  const sourcifyValidationStatus = useMemo(() => {
    if (sourcifyLoading) {
      return (
        <div className="flex space-x-1">
          <Spinner size={'xs'} className="text-primary-500" />
          <VerificationStatus colorClassName="text-primary-800">
            {t('scc.validation.sourcifyStatusPending')}
          </VerificationStatus>
        </div>
      );
    } else {
      if (sourcifyFullData) {
        return (
          <div className="flex space-x-1">
            <IconSuccess className="text-success-500" />
            <VerificationStatus colorClassName="text-success-800">
              {t('scc.validation.sourcifyStatusSuccess')}
            </VerificationStatus>
          </div>
        );
      } else if (sourcifyPartialData) {
        return (
          <div className="flex space-x-1">
            <IconRadioCancel className="text-warning-500" />
            <VerificationStatus colorClassName="text-warning-800">
              {t('scc.validation.sourcifyStatusWarning')}
            </VerificationStatus>
          </div>
        );
      } else {
        return (
          <div className="flex space-x-1">
            <IconRadioCancel className="text-critical-500" />
            <VerificationStatus colorClassName="text-critical-800">
              {t('scc.validation.sourcifyStatusCritical')}
            </VerificationStatus>
          </div>
        );
      }
    }
  }, [sourcifyFullData, sourcifyLoading, sourcifyPartialData, t]);

  const etherscanValidationStatus = useMemo(() => {
    if (etherscanLoading) {
      return (
        <div className="flex space-x-1">
          <Spinner size={'xs'} className="text-primary-500" />
          <VerificationStatus colorClassName="text-primary-800">
            {t('scc.validation.etherscanStatusPending')}
          </VerificationStatus>
        </div>
      );
    } else {
      if (
        etherscanData?.result[0].ABI !== 'Contract source code not verified'
      ) {
        return (
          <div className="flex space-x-1">
            <IconSuccess className="text-success-500" />
            <VerificationStatus colorClassName="text-success-800">
              {t('scc.validation.etherscanStatusSuccess')}
            </VerificationStatus>
          </div>
        );
      } else {
        return (
          <div className="flex space-x-1">
            <IconRadioCancel className="text-critical-500" />
            <VerificationStatus colorClassName="text-critical-800">
              {t('scc.validation.etherscanStatusCritical')}
            </VerificationStatus>
          </div>
        );
      }
    }
  }, [etherscanData?.result, etherscanLoading, t]);

  return (
    <ModalBottomSheetSwitcher isOpen={props.isOpen} onClose={props.onClose}>
      <ModalHeader
        title={t('scc.validation.modalTitle')}
        onClose={() => {
          // clear contract address field
          resetField('contractAddress');
          setVerificationState(TransactionState.WAITING);
          props.onClose();
        }}
        onBackButtonClicked={props.onBackButtonClicked}
        showBackButton={
          !(
            verificationState === TransactionState.LOADING ||
            isTransactionSuccessful
          )
        }
        showCloseButton={!isTransactionLoading}
      />
      <Content>
        <DescriptionContainer>
          <Title>{t('scc.validation.addressInputLabel')}</Title>
          <Description>
            {t('scc.validation.addressInputHelp')}{' '}
            <Link
              external
              label={t('labels.etherscan')}
              href={`${CHAIN_METADATA[network].explorer}`}
            />
          </Description>
        </DescriptionContainer>
        <Controller
          name="contractAddress"
          rules={{
            required: t('errors.required.tokenAddress'),
            validate: addressValidator,
          }}
          control={control}
          defaultValue={''}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <>
              <WalletInput
                mode={error ? 'critical' : 'default'}
                name={name}
                onBlur={onBlur}
                value={value}
                onChange={onChange}
                disabledFilled={isTransactionSuccessful || isTransactionLoading}
                placeholder="0x ..."
                adornmentText={adornmentText}
                onAdornmentClick={() => handleAdornmentClick(value, onChange)}
              />
              <div className="mt-1">
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </div>
            </>
          )}
        />
        {isTransactionLoading ? (
          <ButtonText
            label={t('scc.validation.cancelLabel') as string}
            onClick={async () => {
              queryClient.cancelQueries({
                queryKey: [
                  'verifyContractEtherscan',
                  'verifycontractfull_matchSourcify',
                  'verifycontractpartial_matchSourcify',
                ],
              });
              setVerificationState(TransactionState.WAITING);
            }}
            size="large"
            className="mt-3 w-full"
            bgWhite
          />
        ) : (
          <ButtonText
            label={label[verificationState]}
            onClick={async () => {
              if (verificationState === TransactionState.SUCCESS) {
                props.onVerificationSuccess();
              } else {
                setVerificationState(TransactionState.LOADING);
              }
            }}
            iconLeft={
              isTransactionLoading ? (
                <Spinner size="xs" color="white" />
              ) : undefined
            }
            iconRight={icons[verificationState]}
            isActive={isTransactionLoading}
            disabled={isButtonDisabled}
            size="large"
            className="mt-3 w-full"
          />
        )}
        {!isTransactionWaiting && (
          <VerificationCard>
            <VerificationTitle>
              {/* if contract name is not available, show the address */}
              {contractName || shortenAddress(addressField)}
            </VerificationTitle>
            <VerificationWrapper>
              {sourcifyValidationStatus}
            </VerificationWrapper>
            <VerificationWrapper>
              {etherscanValidationStatus}
            </VerificationWrapper>
          </VerificationCard>
        )}
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default ContractAddressValidation;

const Content = styled.div.attrs({className: 'px-2 tablet:px-3 py-3'})``;

const DescriptionContainer = styled.div.attrs({
  className: 'space-y-0.5 mb-1.5',
})``;

const Title = styled.h2.attrs({
  className: 'text-ui-800 ft-text-base font-bold',
})``;

const Description = styled.p.attrs({
  className: 'ft-text-sm text-ui-600 font-normal',
})``;

const VerificationCard = styled.div.attrs({
  className: 'bg-ui-0 rounded-xl p-2 mt-3 space-y-2',
})``;

const VerificationTitle = styled.h2.attrs({
  className: 'text-ui-600 ft-text-base font-semibold',
})``;

const VerificationWrapper = styled.div.attrs({
  className: 'flex justify-between',
})``;

type VerificationStatusProps = {
  colorClassName: string;
};

const VerificationStatus = styled.span.attrs(
  ({colorClassName}: VerificationStatusProps) => ({
    className: 'ft-text-sm font-semibold ' + colorClassName,
  })
)<VerificationStatusProps>``;
