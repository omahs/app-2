import {ButtonIcon, IconChevronLeft, IconClose} from '@aragon/ods';
import React from 'react';
import styled from 'styled-components';

type Props = {
  title: string;
  onBackButtonClicked: () => void;
  onClose?: () => void;
  showBackButton?: boolean;
  showCloseButton?: boolean;
};

// NOTE: While this header is technically a ui-component,
// keeping it here so we can progressively build it up as needed
// Also, because this will be ui-component, it is encouraged for now
// to use classNames to hide if necessary instead of useScreen and JS
const ModalHeader: React.FC<Props> = props => {
  const {
    showBackButton,
    showCloseButton,
    onBackButtonClicked,
    onClose,
    title,
    ...otherProps
  } = props;

  return (
    <Header>
      <ButtonWrapper className="h-4 w-4">
        {showBackButton && (
          <ButtonIcon
            mode="secondary"
            size="small"
            icon={<IconChevronLeft />}
            onClick={onBackButtonClicked}
            bgWhite
            {...otherProps}
          />
        )}
      </ButtonWrapper>
      <Title>{title}</Title>
      <ButtonWrapper className="h-4 w-4">
        {showCloseButton && (
          <ButtonIcon
            mode="secondary"
            size="small"
            icon={<IconClose />}
            onClick={onClose}
            bgWhite
            className="hidden desktop:block"
          />
        )}
      </ButtonWrapper>
    </Header>
  );
};

export default ModalHeader;

const Header = styled.div.attrs({
  className:
    'flex items-center rounded-xl space-x-2 desktop:space-x-3 p-2 desktop:p-3 bg-ui-0',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Title = styled.div.attrs({
  className: 'flex-1 font-bold text-ui-800 text-center desktop:text-left',
})``;

const ButtonWrapper = styled.div.attrs({className: 'w-4 h-4' as string})``;
