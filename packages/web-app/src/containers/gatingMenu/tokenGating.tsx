import React from 'react';
import {ButtonText} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import WalletIcon from 'public/wallet.svg';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {
  ModalBody,
  StyledImage,
  WarningContainer,
  WarningTitle,
} from 'containers/networkErrorMenu';
import {useDaoToken} from 'hooks/useDaoToken';
import {useDaoParam} from 'hooks/useDaoParam';

export const TokenGating = () => {
  const {close, isRequiredTokenOpen} = useGlobalModalContext();
  const {t} = useTranslation();
  const {data: dao} = useDaoParam();
  const {data: daoToken, isLoading: daoTokenLoading} = useDaoToken(dao);
  const navigate = useNavigate();

  return (
    <ModalBottomSheetSwitcher
      isOpen={isRequiredTokenOpen}
      onClose={() => close('requiredToken')}
    >
      <ModalBody>
        <StyledImage src={WalletIcon} />
        <WarningContainer>
          <WarningTitle>{t('alert.gatingUsers.tokenTitle')}</WarningTitle>
          <WarningDescription>
            {t('alert.gatingUsers.tokenDescription', {
              tokenName: !daoTokenLoading ? daoToken?.name : '',
            })}
          </WarningDescription>
        </WarningContainer>
        <ButtonText
          label={t('alert.gatingUsers.buttonLabel')}
          onClick={() => {
            navigate(-1);
            close('requiredToken');
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
