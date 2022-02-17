import React from 'react';
import styled from 'styled-components';
import {
  ButtonText,
  CheckboxSimple,
  AvatarDao,
  ListItemLink,
} from '@aragon/ui-components';
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

const DaoMetadata: React.FC = () => {
  const {getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {daoLogo, daoName, daoSummary, links} = getValues();

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
            label={daoName}
            contentMode="none"
            src={URL.createObjectURL(daoLogo)}
          />
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Name</Label>
          </LabelWrapper>
          <TextContent>{daoName}</TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Summery</Label>
          </LabelWrapper>
          <DescriptionContent>{daoSummary}</DescriptionContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Links</Label>
          </LabelWrapper>
          <ContentWrapper>
            {links.map(
              ({label, link}: {label: string; link: string}, index: number) => (
                <ListItemLink key={index} label={label} href={link} />
              )
            )}
          </ContentWrapper>
        </Row>
      </Body>
      <Footer>
        <ActionWrapper>
          <ButtonText label="Edit" mode="ghost" onClick={() => setStep(3)} />
        </ActionWrapper>
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
