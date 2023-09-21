import {
  ButtonText,
  IconLinkExternal,
  IconRadioDefault,
  IconRadioSelected,
  Link,
  Tag,
} from '@aragon/ods';
import React from 'react';
import styled from 'styled-components';

export const Icons = {
  active: <IconRadioSelected />,
  default: <IconRadioDefault />,
  error: <IconRadioDefault />,
};

export const UpdateListItem: React.FC = () => {
  return (
    <Container
      data-testid="checkboxListItem"
      type={'default'}
      disabled={false}
      //   {...(disabled ? {} : {onClick})}
      onClick={() => null}
    >
      <div className="flex flex-col space-y-1">
        <HStack disabled={false} type={'default'}>
          <div className="flex space-x-1">
            <p className="font-bold">Aragon OSx v1.3.0</p>
            <Tag label={'Latest'} colorScheme="neutral" />
          </div>
          {Icons['default']}
        </HStack>
        <Helptext>TBD inline release notes</Helptext>
        <Link label={'View release notes'} iconRight={<IconLinkExternal />} />
      </div>
      <div className="flex flex-col gap-y-1.5 mt-3">
        <ButtonText
          label={'Prepare plugin'}
          mode="primary"
          size="medium"
          // onClick={handleAddWallet}
        />
        <ButtonText
          label={'Select another version'}
          mode="secondary"
          size="medium"
          // onClick={handleAddWallet}
        />
      </div>
    </Container>
  );
};

type ContainerTypes = {
  disabled: boolean;
  type: 'default' | 'error' | 'active';
};

const Container = styled.div.attrs(({disabled, type}: ContainerTypes) => ({
  className: `flex-1 py-1.5 px-2 rounded-xl border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
    disabled
      ? 'bg-ui-100 border-ui-300'
      : `bg-ui-0 group hover:border-primary-500 cursor-pointer ${
          type === 'error'
            ? 'border-critical-500'
            : type !== 'default'
            ? 'border-primary-500'
            : 'border-ui-100'
        }`
  }`,
  tabIndex: disabled ? -1 : 0,
}))<ContainerTypes>``;

const HStack = styled.div.attrs(({disabled, type}: ContainerTypes) => ({
  className: `flex justify-between items-center group-hover:text-primary-500 space-x-1.5 ${
    disabled
      ? 'text-ui-600'
      : type === 'default' || type === 'error'
      ? 'text-ui-600'
      : 'text-primary-500'
  }`,
}))<ContainerTypes>``;

const Helptext = styled.p.attrs({
  className: 'ft-text-base text-ui-500 mr-3.5',
})``;
