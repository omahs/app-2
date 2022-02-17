import React from 'react';
import {ButtonText, CheckboxSimple, Link} from '@aragon/ui-components';
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
  const {membership, tokenName, wallets, tokenSymbol, tokenTotalSupply} =
    getValues();

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
