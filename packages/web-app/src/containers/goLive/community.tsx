import React from 'react';
import {ButtonText, CheckboxSimple, Link} from '@aragon/ui-components';
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

const Community: React.FC = () => {
  return (
    <Card>
      <Header>
        <Title>DAO Metadata</Title>
      </Header>
      <Body>
        <Row>
          <LabelWrapper>
            <Label>Eligible Members</Label>
          </LabelWrapper>
          <TextContent>Token Holders</TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Name</Label>
          </LabelWrapper>
          <TextContent>Token Name TKN</TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Supply</Label>
          </LabelWrapper>
          <TextContent>1,000 TKN</TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Distribution</Label>
          </LabelWrapper>
          <Link label="See 50 Addresses" />
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

export default Community;
