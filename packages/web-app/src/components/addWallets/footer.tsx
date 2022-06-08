import React from 'react';
import styled from 'styled-components';
import {Label} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';

type WalletsFooterProps = {
  totalAddresses?: number;
  label?: string;
};

type AddWalletsFooterProps = {
  bgWhite?: boolean;
};

const AddWalletsFooter: React.FC<
  WalletsFooterProps & AddWalletsFooterProps
> = ({totalAddresses, label, bgWhite}) => {
  const {t} = useTranslation();
  const {getValues} = useFormContext();
  const totalSupply = getValues('tokenTotalSupply');

  const addressCount =
    totalAddresses === 1
      ? `${1} ${t('labels.whitelistWallets.address')}`
      : t('labels.whitelistWallets.addresses', {
          count: totalAddresses,
        });

  return (
    <Container bgWhite={bgWhite}>
      <FooterItem1>
        <Label label={label || addressCount} />
      </FooterItem1>
      <FooterItem1>
        <StyledLabel>{totalSupply}</StyledLabel>
      </FooterItem1>
      <FooterItem2>
        <StyledLabel>100%</StyledLabel>
      </FooterItem2>
      <div className="w-8" />
    </Container>
  );
};

export default AddWalletsFooter;

export const Container = styled.div.attrs(
  ({bgWhite}: AddWalletsFooterProps) => ({
    className: `${
      bgWhite ? 'bg-ui-50' : 'bg-ui-0'
    } hidden tablet:flex p-2 space-x-2`,
  })
)<AddWalletsFooterProps>``;

export const FooterItem1 = styled.div.attrs({
  className: 'flex-1',
})``;

export const FooterItem2 = styled.div.attrs({
  className: 'w-8',
})``;

const StyledLabel = styled.p.attrs({
  className: 'font-bold text-ui-800 text-right',
})``;
