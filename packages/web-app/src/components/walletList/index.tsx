import {
  ButtonIcon,
  ButtonText,
  IconMenuVertical,
  ListItemAction,
  Popover,
} from '@aragon/ui-components';
import {t} from 'i18next';
import React, {useEffect} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import styled from 'styled-components';
import {useWallet} from 'use-wallet';
import {Row} from './row';

export const WalletList = () => {
  const {account} = useWallet();
  const {setValue} = useFormContext();
  const walletArray: string[] = useWatch({
    name: 'walletList',
  });
  // add empty wallet
  const handleAddWallet = () => {
    setValue('walletList', [...walletArray, '']);
  };
  useEffect(() => {
    setValue('walletList.0', account);
  }, [account, setValue]);
  return (
    <Container>
      <TableContainer>
        <Header>{t('labels.walletList.address')}</Header>
        {walletArray &&
          walletArray.map((_, index) => (
            <>
              <Divider />
              <Row key={index} index={index} />
            </>
          ))}
        <Divider />
        <Footer>
          {t('labels.walletList.addresses', {count: walletArray?.length || 0})}
        </Footer>
      </TableContainer>
      <ActionsContainer>
        <TextButtonsContainer>
          <ButtonText
            label="Add address"
            mode="secondary"
            size="large"
            onClick={handleAddWallet}
          />
          <ButtonText
            label="Upload CSV"
            mode="ghost"
            size="large"
            onClick={() => alert('upload CSV here')}
          />
        </TextButtonsContainer>
        <Popover
          side="bottom"
          align="end"
          width={264}
          content={
            <div className="p-1.5 space-y-0.5">
              <ListItemAction title="This is a placeholder" bgWhite />
              <ListItemAction title="This is a placeholder 2" bgWhite />
            </div>
          }
        >
          <ButtonIcon
            size="large"
            mode="secondary"
            icon={<IconMenuVertical />}
            data-testid="trigger"
          />
        </Popover>
      </ActionsContainer>
    </Container>
  );
};

const TableContainer = styled.div.attrs(() => ({
  className: 'rounded-xl bg-ui-0 flex flex-col',
}))``;
const Container = styled.div.attrs(() => ({
  className: 'gap-2 flex flex-col',
}))``;
const Header = styled.div.attrs(() => ({
  className: 'pt-3 pl-4 pb-1.5 text-ui-800 font-bold',
}))``;
const Footer = styled.div.attrs(() => ({
  className: 'px-3 py-4 text-ui-800 font-bold',
}))``;
const Divider = styled.div.attrs(() => ({
  className: 'flex bg-ui-50 h-0.25',
}))``;
const ActionsContainer = styled.div.attrs(() => ({
  className: 'flex place-content-between',
}))``;
const TextButtonsContainer = styled.div.attrs(() => ({
  className: 'flex gap-2',
}))``;
