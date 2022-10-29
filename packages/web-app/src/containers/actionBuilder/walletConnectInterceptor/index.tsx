import {
  ButtonIcon,
  ButtonText,
  Dropdown,
  IconMenuVertical,
  Label,
  ListItemAction,
  StateEmpty,
  ValueInput
} from '@aragon/ui-components';
import React, {useEffect, useState, useCallback, MouseEvent, SyntheticEvent} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'components/accordionMethod';
import ManageWalletsModal from 'containers/manageWalletsModal';
import {useActionsContext} from 'context/actions';
import {useGlobalModalContext} from 'context/globalModals';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoParam} from 'hooks/useDaoParam';
import {ActionIndex} from 'utils/types';
import {CustomHeaderProps, FormItem} from '../addAddresses';
import AccordionSummary from '../addAddresses/accordionSummary';
import {AddressRow} from '../addAddresses/addressRow';
import useWalletConnect from 'hooks/useWalletConnectInterceptor';
import {shortenAddress} from '@aragon/ui-components/src/utils/addresses';

type RemoveAddressesProps = ActionIndex & CustomHeaderProps;

const WalletConnectInterceptor: React.FC<RemoveAddressesProps> = ({
  actionIndex,
  useCustomHeader = false,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {removeAction} = useActionsContext();
  const {data: dao} = useDaoParam();
  const { wcClientData, wcConnect, wcDisconnect, transactions, peerMeta } = useWalletConnect();
  const [isConnecting, setIsConnecting] = useState(false)
  const [uri, setUri] = useState('')
  
  const handleReset = () => {
    setUri('')
    wcDisconnect()
  }
  
  const methodActions = [
    {
      component: <ListItemAction title={t('labels.resetAction')} bgWhite />,
      callback: handleReset,
    },
    {
      component: (
        <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
      ),
      callback: () => {
        removeAction(actionIndex);
      }
    }
  ]
  
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUri(event.target.value)
  }
  
  const connectDAO = (event: MouseEvent) => {
    event.preventDefault();
    wcConnect(uri, dao);
  }

  return (
    <AccordionMethod
      verified
      type="action-builder"
      methodName={!peerMeta ? t('AddActionModal.walletConnectInterceptor') : peerMeta.name}
      dropdownItems={methodActions}
      methodDescription={!peerMeta ? t('AddActionModal.walletConnectInterceptorSubtitle') : peerMeta.description}
    >
      <FormItem className="py-3 space-y-3">  
       {
    !peerMeta 
        ? (
          <div className="flex-1">
          <ValueInput
            mode={'default'}
            name="name"
            value={uri}
            onChange={onChangeHandler}
            placeholder={t('placeHolders.walletConnectInterceptorUri')}
          />

            <ButtonContainer>
              <ButtonText
                label={t('labels.connect')}
                mode="secondary"
                size="large"
                bgWhite
                className="flex-1 tablet:flex-initial"
                onClick={connectDAO}
              />
            </ButtonContainer>
          </div>
        )
        : (<img src={peerMeta.icons[0]} width="50" height="50"></img>)
    }
    </FormItem>
    { peerMeta && (!transactions.length
        ? (<FormItem className="py-3 space-y-3 rounded-b-xl"><p>Listening for transactions...</p></FormItem>)
        : (
          <div>
            { transactions.map((tx, index) => (
              <FormItem key={index} className="py-3 space-y-3 rounded-b-xl">
                <p><b>Transaction {index}:</b></p>
                <p>to: {tx.to}</p>
                <p>data: {
                      tx.data.substring(0,20)+
                      '...'+
                      tx.data.substring(tx.data.length-20, tx.data.length)
                }
                </p>
                <p> value: {tx.value}</p>
              </FormItem>
             ))}
         </div>
        )
      )
    }
  </AccordionMethod>
  );
};

export default WalletConnectInterceptor;


const ButtonContainer = styled.div.attrs({
  className:
    'flex justify-between tablet:justify-start p-2 tablet:p-3 space-x-2',
})``;
