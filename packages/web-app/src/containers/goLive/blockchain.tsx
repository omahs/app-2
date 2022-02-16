import React from 'react';
import styled from 'styled-components';
import {ButtonText, CheckboxSimple} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext} from 'react-hook-form';

const Blockchain: React.FC = () => {
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
          <TextContent>Main Net</TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Blockchain</Label>
          </LabelWrapper>
          <TextContent>Arbitrum</TextContent>
        </Row>
      </Body>
      <Footer>
        <LabelWrapper>
          <ButtonText label="Edit" mode="ghost" />
        </LabelWrapper>
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
  className: 'flex mb-2 w-full',
})``;

export const Label = styled.h3.attrs({
  className: 'text-ui-800 font-bold',
})``;

export const LabelWrapper = styled.div.attrs({
  className: 'w-3/12',
})``;

export const TextContent = styled.span.attrs({
  className: 'text-base text-ui-500 font-normal',
})``;

export const Footer = styled.div.attrs({
  className: 'flex',
})``;
