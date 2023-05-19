import {ButtonText} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useGlobalModalContext} from 'context/globalModals';
import IlluMintTokensWarning from 'public/illu-mintTokensWarning.svg';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';

const MintTokensWarningModal: React.FC = () => {
  const {t} = useTranslation();
  const {isMintTokensWarningOpen, close} = useGlobalModalContext();

  return (
    <ModalBottomSheetSwitcher
      isOpen={isMintTokensWarningOpen}
      onClose={() => close('mintTokensWarning')}
    >
      <Container>
        <IllustrationContainer>
          <IllustrationImg src={IlluMintTokensWarning} alt="" />
        </IllustrationContainer>

        <WarningContainer>
          <WarningTitle>
            {'Another proposal is active' || t('labels.yes')}
          </WarningTitle>

          <WarningContent>
            {'Beware of another proposal that mints additional tokens. This implies that the token supply may not be the final one and that it may affect future votes' ||
              t('labels.yes')}
          </WarningContent>
        </WarningContainer>

        <ButtonText
          mode="primary"
          size="large"
          label={'Ok, understood' || t('labels.yes')}
          className="mt-3 w-full"
          onClick={() => close('mintTokensWarning')}
        />
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

const Container = styled.div.attrs({className: 'p-3'})``;

const IllustrationContainer = styled.div.attrs({
  className: 'py-3 flex justify-center',
})``;

const IllustrationImg = styled.img.attrs({
  className: 'w-full h-full',
})`
  max-width: 80px;
  max-height: 80px;
`;

const WarningContainer = styled.div.attrs({
  className:
    'flex flex-col gap-1.5 justify-center items-center mt-1.5 text-center',
})``;

const WarningTitle = styled.div.attrs({
  className: 'font-bold ft-text-xl text-ui-800',
})``;

const WarningContent = styled.div.attrs({
  className: 'ft-text-sm text-ui-500',
})`
  max-width: 350px;
`;

export default MintTokensWarningModal;
