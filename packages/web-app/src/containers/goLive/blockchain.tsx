import React from 'react';
import styled from 'styled-components';
import {ButtonText, CheckboxSimple} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext} from 'react-hook-form';

import {useFormStep} from 'components/fullScreenStepper';

type blockchainDataType = {
  id: number;
  label: string;
  network: string;
};

const Blockchain: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {blockchain} = getValues();

  return (
    <Card>
      <Header>
        <Title>Blockchain</Title>
      </Header>
      <Body>
        <Row>
          <LabelWrapper>
            <Label>Network</Label>
          </LabelWrapper>
          <TextContent>{blockchain.network} net</TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Blockchain</Label>
          </LabelWrapper>
          <TextContent>{blockchain.label}</TextContent>
        </Row>
      </Body>
      <Footer>
        <ActionWrapper>
          <ButtonText label="Edit" mode="ghost" onClick={() => setStep(2)} />
        </ActionWrapper>
        <CheckboxSimple label="These values are correct" multiSelect />
      </Footer>
    </Card>
  );
};

export default Blockchain;

export const Card = styled.div.attrs({
  className: 'bg-ui-0 rounded-xl p-3 w-full mb-5',
})``;

export const Header = styled.div.attrs({
  className: 'flex pb-3',
})``;

export const Title = styled.h2.attrs({
  className: 'font-bold text-lg',
})``;

export const Body = styled.div.attrs({
  className: 'pb-1',
})``;

export const Row = styled.div.attrs({
  className: 'block tablet:flex mb-2 w-full',
})``;

export const Label = styled.h3.attrs({
  className: 'text-ui-800 font-bold pb-0.5 tablet:pb-0',
})``;

export const LabelWrapper = styled.div.attrs({
  className: 'w-full tablet:w-3/12',
})``;

export const TextContent = styled.span.attrs({
  className: 'text-base text-ui-500 font-normal',
})``;

export const Footer = styled.div.attrs({
  className:
    'flex flex-row-reverse tablet:flex-row justify-between tablet:justify-start',
})``;

export const ActionWrapper = styled.div.attrs({
  className: 'order-first tablet:md:order-last w-fit tablet:w-3/12',
})``;
