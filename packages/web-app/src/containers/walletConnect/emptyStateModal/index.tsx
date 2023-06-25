import {ButtonText} from '@aragon/ui-components';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import WalletConnectSVG from 'public/walletConnect.svg';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalHeader from 'components/modalHeader';
import useScreen from 'hooks/useScreen';
import {htmlIn} from 'utils/htmlIn';

type Props = {
  onBackButtonClicked: () => void;
  onClose: () => void;
  onCtaClicked: () => void;
  isOpen: boolean;
};

const EmptyState: React.FC<Props> = props => {
  const {t} = useTranslation();
  const {isDesktop} = useScreen();

  return (
    <ModalBottomSheetSwitcher isOpen={props.isOpen} onClose={props.onClose}>
      <ModalHeader
        title={t('wc.emptyState.modalTitle')}
        onClose={props.onClose}
        showBackButton
        onBackButtonClicked={props.onBackButtonClicked}
        {...(isDesktop ? {showCloseButton: true} : {})}
      />
      <Content>
        <div className="flex justify-center items-center h-14 desktop:h-20">
          <img src={WalletConnectSVG} />
        </div>
        <ContentWrapper>
          <TextWrapper>
            <Title>{t('wc.emptyState.title')}</Title>
            <Description
              dangerouslySetInnerHTML={{
                __html: htmlIn(t)('wc.emptyState.desc'),
              }}
            />
          </TextWrapper>
          <ButtonText
            label={t('wc.emptyState.ctaLabel')}
            mode="primary"
            size="large"
            className="w-full"
          />
        </ContentWrapper>
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default EmptyState;

const Content = styled.div.attrs({
  className: 'px-2 tablet:px-3 pb-3',
})``;

const ContentWrapper = styled.div.attrs({className: 'space-y-3 w-full'})``;

const TextWrapper = styled.div.attrs({
  className: 'space-y-1.5 text-center',
})``;

const Title = styled.h2.attrs({
  className: 'ft-text-xl font-bold text-ui-800',
})``;

const Description = styled.p.attrs({
  className: 'text-ui-500 ft-text-sm tablet:ft-text-base',
})`
  & > a {
    color: #003bf5;
    font-weight: 700;
`;
