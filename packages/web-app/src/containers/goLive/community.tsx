import React from 'react';
import {ButtonText, CheckboxSimple, Link} from '@aragon/ui-components';
import {useFormContext} from 'react-hook-form';

import {useFormStep} from 'components/fullScreenStepper';

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

const Community: React.FC = () => {
  const {getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {membership, tokenName, tokenSymbol, tokenTotalSupply} = getValues();

  return (
    <Card>
      <Header>
        <Title>Community</Title>
      </Header>
      <Body>
        <Row>
          <LabelWrapper>
            <Label>Eligible Members</Label>
          </LabelWrapper>
          <TextContent>{membership}</TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Name</Label>
          </LabelWrapper>
          <TextContent>
            {tokenName}&nbsp;&nbsp;{tokenSymbol}
          </TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Supply</Label>
          </LabelWrapper>
          <TextContent>
            {tokenTotalSupply} {tokenSymbol}
          </TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Distribution</Label>
          </LabelWrapper>
          <Link label="See 50 Addresses" />
        </Row>
      </Body>
      <Footer>
        <ActionWrapper>
          <ButtonText label="Edit" mode="ghost" onClick={() => setStep(4)} />
        </ActionWrapper>
        <CheckboxSimple label="These values are correct" multiSelect />
      </Footer>
    </Card>
  );
};

export default Community;
