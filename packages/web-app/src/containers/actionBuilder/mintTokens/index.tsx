import {
  Popover,
  ListItemAction,
  ButtonIcon,
  IconMenuVertical,
  AlertInline,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
import React, {useState} from 'react';

import {useActionsContext} from 'context/actions';
import AddAddress from './addAddress';

type Props = {
  index: number;
};

const MintTokens: React.FC<Props> = ({index}) => {
  const {t} = useTranslation();
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const {removeAction, duplicateAction} = useActionsContext();
  const {setValue, clearErrors} = useFormContext();

  const resetWithdrawFields = () => {
    clearErrors(`actions.${index}`);
    setValue(`actions.${index}`, {
      to: '',
      amount: '',
      tokenAddress: '',
      tokenSymbol: '',
    });
  };

  return (
    <Container>
      <Header>
        <HCWrapper>
          <Title>{t('AddActionModal.mintTokens')}</Title>
          <Description>{t('AddActionModal.mintTokensDescription')}</Description>
        </HCWrapper>
        <Popover
          open={openMenu}
          onOpenChange={setOpenMenu}
          side="bottom"
          align="end"
          width={264}
          content={
            <div className="p-1.5 space-y-0.5">
              <ListItemAction
                title={t('labels.duplicateAction')}
                onClick={() => {
                  duplicateAction(index);
                  setOpenMenu(false);
                }}
                bgWhite
              />
              <ListItemAction
                title={t('labels.resetAction')}
                onClick={() => {
                  resetWithdrawFields();
                  setOpenMenu(false);
                }}
                bgWhite
              />
              <ListItemAction
                title={t('labels.removeEntireAction')}
                onClick={() => {
                  removeAction(index);
                  setOpenMenu(false);
                }}
                bgWhite
              />
            </div>
          }
        >
          <ButtonIcon
            mode="ghost"
            size="large"
            icon={<IconMenuVertical />}
            data-testid="trigger"
          />
        </Popover>
      </Header>
      <AlertInline label={t('AddActionModal.mintTokensAlert')} />
      <Body>
        <AddAddress />
      </Body>
    </Container>
  );
};

export default MintTokens;

const Container = styled.div.attrs({
  className: 'bg-ui-0 rounded-xl p-3',
})``;

const Header = styled.div.attrs({
  className: 'flex justify-between items-center mb-2 space-x-4',
})``;

const Body = styled.div.attrs({
  className: 'rounded-xl mt-3',
})``;

const Title = styled.h2.attrs({
  className: 'text-base font-bold text-ui-800',
})``;

const Description = styled.p.attrs({
  className: 'text-sm text-ui-600',
})``;

const HCWrapper = styled.div.attrs({
  className: 'space-y-0.5',
})``;
