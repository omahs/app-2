import React from 'react';
import {ButtonText, CheckboxSimple} from '@aragon/ui-components';
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
} from './blockchain';

const Governance: React.FC = () => {
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
          <TextContent>15% (150 TKN)</TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Minimum Support</Label>
          </LabelWrapper>
          <TextContent>50%</TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Minimum Duration</Label>
          </LabelWrapper>
          <TextContent>5 Days 12 Hours 30 Minutes</TextContent>
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

export default Governance;
