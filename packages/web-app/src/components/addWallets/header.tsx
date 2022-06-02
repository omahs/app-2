import React from 'react';
import styled from 'styled-components';
import {Label} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';

type AddWalletsHeaderProps = {
  bgWhite?: boolean;
};

const AddWalletsHeader: React.FC<AddWalletsHeaderProps> = ({bgWhite}) => {
  const {t} = useTranslation();

  return (
    <Container bgWhite={bgWhite}>
      <HeaderItem>
        <Label label={t('labels.whitelistWallets.address')} />
      </HeaderItem>
      <HeaderItem>
        <StyledLabel>{t('finance.tokens')}</StyledLabel>
      </HeaderItem>
      <div className="w-36" />
    </Container>
  );
};

export default AddWalletsHeader;

export const Container = styled.div.attrs(
  ({bgWhite}: AddWalletsHeaderProps) => ({
    className: `${
      bgWhite ? 'bg-ui-50' : 'bg-ui-0'
    } hidden tablet:flex p-2 space-x-2`,
  })
)<AddWalletsHeaderProps>``;

export const HeaderItem = styled.div.attrs({
  className: 'flex-1',
})``;

const StyledLabel = styled.p.attrs({
  className: 'font-bold text-ui-800 text-right',
})``;
