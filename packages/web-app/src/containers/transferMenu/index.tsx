import React from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ActionListItem, IconChevronRight} from '@aragon/ui-components';

import {NewDeposit, NewWithDraw} from 'utils/paths';
import {useGlobalModalContext} from 'context/globalModals';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useSigner} from 'use-signer';

const TransferMenu: React.FC = () => {
  const {isTransferOpen, close, open} = useGlobalModalContext();
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {status, methods} = useSigner();
  const isConnected = status === 'connected';

  const handleActionClick = (action: 'deposit' | 'withdraw') => {
    if (isConnected) {
      switch (action) {
        case 'deposit':
          navigate(NewDeposit);
          close('default');
          break;
        case 'withdraw':
          // TODO: Check if wallet address is authorized to access new withdraw page and then navigate
          navigate(NewWithDraw);
          close('default');
          break;
      }
    } else {
      methods
        .selectWallet()
        .then(() => {
          open('default');
        })
        .catch(err => {
          console.error(err);
        });
    }
  };

  return (
    <ModalBottomSheetSwitcher
      isOpen={isTransferOpen}
      onClose={() => close('default')}
      title={t('TransferModal.newTransfer') as string}
    >
      <Container>
        <ActionListItem
          title={t('TransferModal.item1Title') as string}
          subtitle={t('TransferModal.item1Subtitle') as string}
          icon={<IconChevronRight />}
          onClick={() => handleActionClick('deposit')}
        />
        <ActionListItem
          title={t('TransferModal.item2Title') as string}
          subtitle={t('TransferModal.item2Subtitle') as string}
          icon={<IconChevronRight />}
          onClick={() => handleActionClick('withdraw')}
        />
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

export default TransferMenu;

const Container = styled.div.attrs({
  className: 'space-y-1.5 p-3',
})``;
