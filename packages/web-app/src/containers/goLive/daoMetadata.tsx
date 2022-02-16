import React from 'react';
import styled from 'styled-components';
import {
  ButtonText,
  CheckboxSimple,
  AvatarDao,
  ListItemLink,
} from '@aragon/ui-components';
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

const DaoMetadata: React.FC = () => {
  return (
    <Card>
      <Header>
        <Title>DAO Metadata</Title>
      </Header>
      <Body>
        <Row>
          <LabelWrapper>
            <Label>Logo</Label>
          </LabelWrapper>
          <AvatarDao
            label="daoName"
            contentMode="none"
            src="https://banner2.cleanpng.com/20180325/sxw/kisspng-computer-icons-avatar-avatar-5ab7529a8e4e14.9936310115219636745829.jpg"
          />
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Name</Label>
          </LabelWrapper>
          <TextContent>Aragon DAO</TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Summery</Label>
          </LabelWrapper>
          <DescriptionContent>
            This is a short description of your DAO, so please look that it’s
            not that long as wished. 👀
          </DescriptionContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Links</Label>
          </LabelWrapper>
          <ContentWrapper>
            <ListItemLink label="Forum" href="https://aragon.org/" />
            <ListItemLink label="Discord Server" href="https://aragon.org/" />
            <ListItemLink label="Discord Server" href="https://aragon.org/" />
          </ContentWrapper>
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

const ContentWrapper = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const DescriptionContent = styled.p.attrs({
  className: 'w-9/12',
})``;

export default DaoMetadata;
