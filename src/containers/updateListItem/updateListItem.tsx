import {
  ButtonText,
  IconCheckboxDefault,
  IconCheckboxSelected,
  IconLinkExternal,
  Link,
  Tag,
} from '@aragon/ods';
import React from 'react';
import styled from 'styled-components';

export const Icons = {
  active: <IconCheckboxSelected />,
  default: <IconCheckboxDefault />,
  error: <IconCheckboxDefault />,
};

export type CheckboxListItemProps = {
  label: string;
  helptext?: string;
  LinkLabel: string;
  tagLabelNatural?: string;
  tagLabelInfo?: string;
  disabled?: boolean;
  type?: 'default' | 'error' | 'active';
  onClick?: React.MouseEventHandler;
  onClickActionPrimary?: () => void;
  onClickActionSecondary?: () => void;
};

// TODO: This might be a component that
export const UpdateListItem: React.FC<CheckboxListItemProps> = ({
  label,
  helptext,
  LinkLabel,
  tagLabelNatural,
  tagLabelInfo,
  disabled = false,
  type = 'default',
  onClick,
  onClickActionPrimary,
  onClickActionSecondary,
}) => {
  return (
    <Container data-testid="checkboxListItem" {...{type, disabled, onClick}}>
      <Wrapper>
        <div className="flex flex-col space-y-1">
          <HStack {...{disabled, type}}>
            <div className="flex space-x-1">
              <p className="font-semibold ft-text-base">{label}</p>
              {tagLabelNatural && (
                <Tag label={tagLabelNatural} colorScheme="neutral" />
              )}
              {tagLabelInfo && <Tag label={tagLabelInfo} colorScheme="info" />}
            </div>
            {Icons[type]}
          </HStack>
          <Helptext>{helptext}</Helptext>
          <Link label={LinkLabel} iconRight={<IconLinkExternal />} />
        </div>
        <div className="flex flex-col gap-y-1.5 mt-3">
          {onClickActionPrimary && (
            <ButtonText
              label={'Prepare plugin'}
              mode="primary"
              size="medium"
              onClick={onClickActionPrimary}
            />
          )}
          {onClickActionSecondary && (
            <ButtonText
              label={'Select another version'}
              mode="secondary"
              bgWhite
              size="medium"
              onClick={onClickActionSecondary}
            />
          )}
        </div>
      </Wrapper>
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

const Wrapper = styled.div.attrs({
  className: 'flex flex-col justify-between h-full',
})``;

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
