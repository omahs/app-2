import {
  ButtonIcon,
  Dropdown,
  IconMenuVertical,
  Label,
  ListItemAction,
  InputValue as WalletInputValue,
} from '@aragon/ods';
import React, {useCallback} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {WrappedWalletInput} from 'components/wrappedWalletInput';
import {useAlertContext} from 'context/alert';
import {useProviders} from 'context/providers';
import {walletInWalletList, Web3Address} from 'utils/library';
import {validateWeb3Address} from 'utils/validators';
import {MultisigWalletField} from 'components/multisigWallets/row';

type WalletRowProps = {
  index: number;
  onDelete?: (index: number) => void;
};

const WalletRow: React.FC<WalletRowProps> = ({index, onDelete}) => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {infura: provider} = useProviders();

  const {control} = useFormContext();
  const [committee, multisigWallets, wallets, membership]: [
    MultisigWalletField[],
    MultisigWalletField[],
    MultisigWalletField[],
    'multisig' | 'token'
  ] = useWatch({
    name: ['committee', 'multisigWallets', 'wallets', 'membership'],
    control,
  });

  const addressValidator = useCallback(
    async ({address, ensName}: WalletInputValue, index: number) => {
      const web3Address = new Web3Address(provider, address, ensName);

      // check if address is valid
      let validationResult = await validateWeb3Address(
        web3Address,
        t('errors.required.walletAddress'),
        t
      );

      if (validationResult && validationResult !== true)
        return validationResult;

      if (
        committee?.some(
          (wallet, walletIndex) =>
            ((web3Address.address && wallet.address === web3Address.address) ||
              (web3Address.ensName &&
                wallet.ensName === web3Address.ensName)) &&
            walletIndex !== index
        )
      ) {
        validationResult = t('errors.duplicateAddress');
      } else if (
        (membership === 'multisig' &&
          !walletInWalletList(web3Address, multisigWallets)) ||
        (membership === 'token' && !walletInWalletList(web3Address, wallets))
      ) {
        validationResult = t('errors.addressNotElegible');
      }
      return validationResult;
    },
    [provider, t, committee]
  );

  const handleOnChange = useCallback(
    // to avoid nesting the InputWallet value, add the existing amount
    // when the value of the address/ens changes
    (e: unknown, onChange: (e: unknown) => void) => {
      onChange({
        ...(e as WalletInputValue),
      });
    },
    [index, committee]
  );

  return (
    <Container>
      <Controller
        defaultValue={{address: '', ensName: ''}}
        name={`committee.${index}`}
        control={control}
        rules={{validate: value => addressValidator(value, index)}}
        render={({
          field: {name, ref, value, onBlur, onChange},
          fieldState: {error},
        }) => (
          <AddressWrapper>
            <LabelWrapper>
              <Label label={t('labels.whitelistWallets.address')} />
            </LabelWrapper>
            <WrappedWalletInput
              state={error && 'critical'}
              value={value}
              onBlur={onBlur}
              onChange={e => handleOnChange(e, onChange)}
              error={error?.message}
              showResolvedLabels={false}
              ref={ref}
              name={name}
            />
          </AddressWrapper>
        )}
      />

      <DropdownMenuWrapper>
        {/* Disable index 0 when minting to DAO Treasury is supported */}
        <Dropdown
          align="start"
          trigger={
            <ButtonIcon
              mode="ghost"
              size="large"
              bgWhite
              icon={<IconMenuVertical />}
              data-testid="trigger"
            />
          }
          sideOffset={8}
          listItems={[
            {
              component: (
                <ListItemAction
                  title={t('labels.removeWallet')}
                  {...(typeof onDelete !== 'function' && {mode: 'disabled'})}
                  bgWhite
                />
              ),
              callback: () => {
                if (typeof onDelete === 'function') {
                  onDelete(index);
                  alert(t('alert.chip.removedAddress') as string);
                }
              },
            },
          ]}
        />
      </DropdownMenuWrapper>
    </Container>
  );
};

export default WalletRow;

const Container = styled.div.attrs({
  className: 'flex flex-wrap gap-x-2 gap-y-1.5 p-2 bg-ui-0',
})``;

const LabelWrapper = styled.div.attrs({
  className: 'tablet:hidden mb-0.5',
})``;

const AddressWrapper = styled.div.attrs({
  className: 'flex-1 order-1',
})``;

const DropdownMenuWrapper = styled.div.attrs({
  className: 'flex order-2 tablet:order-5 mt-3.5 tablet:mt-0 w-6',
})``;
