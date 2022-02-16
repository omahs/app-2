import React from 'react';
import {ButtonText, CheckboxSimple} from '@aragon/ui-components';
import {useFormContext} from 'react-hook-form';

import {
  Card,
  Header,
  Title,
  Body,
  Row,
  Label,
  LabelWrapper,
  TextContent,
  Footer,
  ActionWrapper,
} from './blockchain';

const Governance: React.FC = () => {
  const {getValues} = useFormContext();
  const {
    minimumApproval,
    tokenTotalSupply,
    tokenSymbol,
    support,
    minutes,
    hours,
    days,
  } = getValues();

  return (
    <Card>
      <Header>
        <Title>Governance</Title>
      </Header>
      <Body>
        <Row>
          <LabelWrapper>
            <Label>Minimum Approval</Label>
          </LabelWrapper>
          <TextContent>
            {minimumApproval}% (
            {Math.floor(tokenTotalSupply * (minimumApproval / 100))}{' '}
            {tokenSymbol})
          </TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Minimum Support</Label>
          </LabelWrapper>
          <TextContent>{support}%</TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Minimum Duration</Label>
          </LabelWrapper>
          <TextContent>
            {days} Days {hours} Hours {minutes} Minutes
          </TextContent>
        </Row>
      </Body>
      <Footer>
        <ActionWrapper>
          <ButtonText label="Edit" mode="ghost" />
        </ActionWrapper>
        <CheckboxSimple label="These values are correct" multiSelect />
      </Footer>
    </Card>
  );
};

export default Governance;
