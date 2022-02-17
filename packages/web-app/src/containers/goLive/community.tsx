import React from 'react';
import styled from 'styled-components';
import {ButtonText, CheckboxSimple, Link, Badge} from '@aragon/ui-components';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

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
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {t} = useTranslation();
  const {
    membership,
    tokenName,
    wallets,
    isCustomToken,
    tokenSymbol,
    tokenTotalSupply,
  } = getValues();

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
            <Label>Token</Label>
          </LabelWrapper>
          <BadgeWrapper>
            <TextContent>
              {tokenName}&nbsp;&nbsp;{tokenSymbol}
            </TextContent>
            {isCustomToken && <Badge label="New" colorScheme="info" />}
          </BadgeWrapper>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Supply</Label>
          </LabelWrapper>
          <BadgeWrapper>
            <TextContent>
              {tokenTotalSupply} {tokenSymbol}
            </TextContent>
            <Badge label="Fixed" colorScheme="neutral" />
          </BadgeWrapper>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>Distribution</Label>
          </LabelWrapper>
          <Link label={`See ${wallets?.length} Addresses`} />
        </Row>
      </Body>
      <Footer>
        <ActionWrapper>
          <ButtonText label="Edit" mode="ghost" onClick={() => setStep(4)} />
        </ActionWrapper>
        <Controller
          name="reviewCheck.community"
          control={control}
          defaultValue={false}
          rules={{
            required: t('errors.required.recipient'),
          }}
          render={({field: {onChange, value}}) => (
            <CheckboxSimple
              state={value ? 'active' : 'default'}
              label="These values are correct"
              onClick={() => onChange(!value)}
              multiSelect
            />
          )}
        />
      </Footer>
    </Card>
  );
};

export default Community;

const BadgeWrapper = styled.div.attrs({
  className: 'flex space-x-1.5',
})``;
