import {IconChevronRight} from '@aragon/ods';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {ListItemContract} from './listItemContract';
import {SccFormData} from 'containers/smartContractComposer';

const SmartContractListGroup: React.FC = () => {
  const {t} = useTranslation();
  const {setValue, getValues} = useFormContext<SccFormData>();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const contracts = getValues('contracts') || [];

  return (
    <ListGroup>
      <ContractNumberIndicator>
        {contracts.length === 1
          ? t('scc.labels.singleContractConnected')
          : t('scc.labels.nContractsConnected', {
              numConnected: contracts.length,
            })}
      </ContractNumberIndicator>
      {contracts.map(c => (
        <ListItemContract
          key={c.address}
          title={c.name}
          subtitle={t('scc.listContracts.contractAmountActions', {
            amount: c.actions
              .filter(
                a =>
                  a.type === 'function' &&
                  (a.stateMutability === 'payable' ||
                    a.stateMutability === 'nonpayable')
              )
              .length.toString(),
          })}
          logo={c.logo}
          bgWhite
          iconRight={<IconChevronRight />}
          onClick={() => {
            setValue('selectedSC', c);
            setValue(
              'selectedAction',
              c.actions.filter(
                a =>
                  a.type === 'function' &&
                  (a.stateMutability === 'payable' ||
                    a.stateMutability === 'nonpayable')
              )?.[0]
            );
          }}
        />
      ))}
    </ListGroup>
  );
};

export default SmartContractListGroup;

const ListGroup = styled.div.attrs({className: 'pb-2 space-y-1'})``;

const ContractNumberIndicator = styled.div.attrs({
  className: 'ft-text-sm font-bold text-ui-400',
})``;
