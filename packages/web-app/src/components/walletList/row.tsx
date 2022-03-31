import React from 'react';
import {
  ButtonIcon,
  IconMenuVertical,
  ListItemAction,
  Popover,
  AlertInline,
  ValueInput,
} from '@aragon/ui-components';
import {t} from 'i18next';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import styled from 'styled-components';
import {useWallet} from 'use-wallet';
import {handleClipboardActions} from 'utils/library';
import {validateAddress} from 'utils/validators';

type WalletListRowProps = {
  index: number;
};

export const Row = ({index}: WalletListRowProps) => {
  const {control, setValue} = useFormContext();
  // TODO update with useSigner
  const {account} = useWallet();
  const walletList = useWatch({name: 'walletList'});
  const handleDeleteWallet = () => {
    const newWalletList = [...walletList];
    newWalletList.splice(index, 1);
    setValue('walletList', newWalletList);
  };
  const handleDeleteAllAddresses = () => {
    setValue('walletList', [account, '']);
  };
  const addressValidator = (address: string, index: number) => {
    let validationResult = validateAddress(address);
    if (walletList) {
      walletList.forEach((wallet: string, walletIndex: number) => {
        if (address === wallet && index !== walletIndex) {
          validationResult = t('errors.duplicateAddress') as string;
        }
      });
    }
    return validationResult;
  };
  return (
    <Controller
      name={`walletList.${index}`}
      defaultValue={null}
      control={control}
      rules={{
        required: t('errors.required.walletAddress') as string,
        validate: value => addressValidator(value, index),
      }}
      render={({field: {onChange, value}, fieldState: {error}}) => (
        <Container>
          <InputContainer>
            <ValueInput
              value={value === account ? 'My Wallet' : value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(
                  e.target.value === account ? 'My Wallet' : e.target.value
                );
              }}
              mode="default"
              placeholder="0x..."
              adornmentText={value ? 'Copy' : 'Paste'}
              disabled={value === account}
              onAdornmentClick={() => handleClipboardActions(value, onChange)}
            />
            {error?.message && (
              // <ErrorContainer>
              <AlertInline label={error.message} mode="critical" />
              // </ErrorContainer>
            )}
          </InputContainer>
          <Popover
            side="bottom"
            align="end"
            width={264}
            content={
              <div className="p-1.5 space-y-0.5">
                {value !== account && (
                  <ListItemAction
                    title={t('labels.removeWallet')}
                    onClick={handleDeleteWallet}
                    bgWhite
                  />
                )}
                {value === account && (
                  <ListItemAction
                    title={t('labels.deleteAllAddresses')}
                    onClick={handleDeleteAllAddresses}
                    bgWhite
                  />
                )}
              </div>
            }
          >
            <ButtonIcon
              mode="ghost"
              size="large"
              disabled={walletList.length <= 2}
              bgWhite
              icon={<IconMenuVertical />}
              data-testid="trigger"
            />
          </Popover>
        </Container>
      )}
    />
  );
};

const Container = styled.div.attrs(() => ({
  className: 'px-2 py-1.5 flex gap-2 items-center',
}))``;
const InputContainer = styled.div.attrs(() => ({
  className: 'flex flex-col gap-1 flex-1',
}))``;
