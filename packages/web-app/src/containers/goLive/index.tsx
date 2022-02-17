import React, {useMemo} from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
import {ButtonText, IconChevronRight} from '@aragon/ui-components';

import {useFormStep} from 'components/fullScreenStepper';
import Blockchain from './blockchain';
import DaoMetadata from './daoMetadata';
import Community from './community';
import Governance from './governance';
import goLive from 'public/goLive.svg';

export const GoLiveHeader: React.FC = () => {
  const {t} = useTranslation();

  return (
    <div className="flex justify-between tablet:px-6 px-2 rounded-xl bg-ui-0">
      <div className="py-6 w-full">
        <h1 className="text-3xl font-bold text-ui-800">Go Live</h1>
        <p className="mt-2 text-lg text-ui-600">
          Take your DAO public by completing the final review and cross-checking
          the values.
        </p>
      </div>
      <ImageContainer src={goLive} />
    </div>
  );
};

const GoLive: React.FC = () => {
  const {control, getValues} = useFormContext();
  console.log(getValues());

  return (
    <Container>
      <Blockchain />
      <DaoMetadata />
      <Community />
      <Governance />
    </Container>
  );
};

export const GoLiveFooter: React.FC = () => {
  const {next} = useFormStep();
  const {watch, getValues} = useFormContext();
  const {reviewCheck} = watch();
  console.log('isCustomToken', getValues());

  const IsButtonDisabled = () =>
    !(Object.values(reviewCheck).every(v => v === true) as boolean);

  return (
    <div className="flex justify-center pt-3">
      <ButtonText
        size="large"
        iconRight={<IconChevronRight />}
        label="Publish your DAO"
        onClick={next}
        disabled={IsButtonDisabled()}
      />
    </div>
  );
};

export default GoLive;

const Container = styled.div.attrs({
  className: 'flex flex-col',
})``;

const ImageContainer = styled.img.attrs({
  className: 'w-25 hidden tablet:block',
})``;
