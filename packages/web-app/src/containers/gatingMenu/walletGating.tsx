import React from 'react';
import {ButtonText} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {useNavigate, generatePath} from 'react-router-dom';

import WalletIcon from 'public/wallet.svg';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {
  ModalBody,
  StyledImage,
  WarningContainer,
  WarningTitle,
} from 'containers/networkErrorMenu';
import {Governance} from 'utils/paths';
import {useDaoParam} from 'hooks/useDaoParam';
import {useNetwork} from 'context/network';

export const WalletGating = () => {
  const {close, isRequiredWalletOpen} = useGlobalModalContext();
  const {t} = useTranslation();
  const {data: dao} = useDaoParam();
  const {network} = useNetwork();
  const navigate = useNavigate();

  return (
    <ModalBottomSheetSwitcher
      isOpen={isRequiredWalletOpen}
      onClose={() => close('requiredWallet')}
    >
      <ModalBody>
        <StyledImage src={WalletIcon} />
        <WarningContainer>
          <WarningTitle>{t('alert.gatingUsers.walletTitle')}</WarningTitle>
          <WarningDescription>
            {t('alert.gatingUsers.walletDescription')}
          </WarningDescription>
        </WarningContainer>
        <ButtonText
          label={t('alert.gatingUsers.buttonLabel')}
          onClick={() => {
            navigate(generatePath(Governance, {network, dao}));
            close('requiredWallet');
          }}
          size="large"
        />
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

const WarningDescription = styled.p.attrs({
  className: 'text-base text-ui-500 text-center',
})``;
