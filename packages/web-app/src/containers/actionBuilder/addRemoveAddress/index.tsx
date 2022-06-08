import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
// import {useFormContext} from 'react-hook-form';
import React from 'react';

// import {useActionsContext} from 'context/actions';

type Props = {
  index: number;
};

const AddRemoveAddresses: React.FC<Props> = () => {
  const {t} = useTranslation();
  // const [openMenu, setOpenMenu] = useState<boolean>(false);
  // const {removeAction, duplicateAction, setActionsCounter} =
  //   useActionsContext();
  // const {setValue, clearErrors} = useFormContext();

  // const resetWithdrawFields = () => {
  //   clearErrors(`actions.${index}`);
  //   setValue(`actions.${index}`, {
  //     to: '',
  //     amount: '',
  //     tokenAddress: '',
  //     tokenSymbol: '',
  //   });
  // };

  return (
    <Container>
      <HCWrapper>
        <Title>{t('AddActionModal.addAddress')}</Title>
        <Description>{t('AddActionModal.addAddressSubtitle')}</Description>
      </HCWrapper>
      <Body></Body>
      <HCWrapper>
        <Title>{t('AddActionModal.removeAddress')}</Title>
        <Description>{t('AddActionModal.removeAddressSubtitle')}</Description>
      </HCWrapper>
      <Body></Body>
    </Container>
  );
};

export default AddRemoveAddresses;

const Container = styled.div.attrs({
  className: 'bg-ui-0 rounded-xl p-3',
})``;

const HCWrapper = styled.div.attrs({
  className: 'space-y-0.5 mb-2',
})``;

const Body = styled.div.attrs({
  className: 'rounded-xl mt-3',
})``;

const Title = styled.h2.attrs({
  className: 'text-base font-bold text-ui-800',
})``;

const Description = styled.p.attrs({
  className: 'text-sm text-ui-600',
})``;
