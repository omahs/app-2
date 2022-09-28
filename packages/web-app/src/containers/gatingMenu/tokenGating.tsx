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
import {useDaoToken} from 'hooks/useDaoToken';
import {useDaoParam} from 'hooks/useDaoParam';
import {Governance} from 'utils/paths';
import {useNetwork} from 'context/network';

export const TokenGating = () => {
  const {close, isRequiredTokenOpen} = useGlobalModalContext();
  const {t} = useTranslation();
  const {data: dao} = useDaoParam();
  const {data: daoToken, isLoading: daoTokenLoading} = useDaoToken(dao);
  const {network} = useNetwork();
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
            navigate(generatePath(Governance, {network, dao}));
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
