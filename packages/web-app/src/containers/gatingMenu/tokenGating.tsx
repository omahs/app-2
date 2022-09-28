import React from 'react';
import {ButtonText} from '@aragon/ui-components';
import {useGlobalModalContext} from 'context/globalModals';
import styled from 'styled-components';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useTranslation} from 'react-i18next';
import WalletIcon from 'public/wallet.svg';
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
  const {data: daoId} = useDaoParam();
  const {data: daoToken, isLoading: daoTokenLoading} = useDaoToken(daoId);

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
          onClick={() => close('requiredToken')}
          size="large"
        />
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

const WarningDescription = styled.p.attrs({
  className: 'text-base text-ui-500 text-center',
})``;
