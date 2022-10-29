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
// import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'components/accordionMethod';
import {useActionsContext} from 'context/actions';
import {useGlobalModalContext} from 'context/globalModals';
import {useDaoParam} from 'hooks/useDaoParam';
import {ActionIndex, MinimalTransactionInput} from 'utils/types';
import {CustomHeaderProps, FormItem} from '../addAddresses';
import useWalletConnect from 'hooks/useWalletConnectInterceptor';
import {decodeTransactionInputs} from 'services/transactionDecoder';
import {TransactionDescription} from 'ethers/lib/utils';
import {ethers} from 'ethers';

type RemoveAddressesProps = ActionIndex & CustomHeaderProps;
interface ExtendedTransactionDescription extends TransactionDescription {
  id: number;
}

const WalletConnectInterceptor: React.FC<RemoveAddressesProps> = ({
  actionIndex,
  useCustomHeader = false,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {removeAction} = useActionsContext();
  const {data: dao} = useDaoParam();
  const { wcClientData, wcConnect, wcDisconnect, transactions, peerMeta } = useWalletConnect();
  const [transactionDescriptions, setTransactionDescriptions] = useState<Array<MinimalTransactionInput | ExtendedTransactionDescription>>([]);
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
  
  useEffect(() => {
   transactions.forEach(tx => {
      console.log('Going through this tx:', tx)
      if (!transactionDescriptions.some(td => tx.id === td.id))
        decodeTransactionInputs(tx).then(transactionDescriptionAttempt => {
          if (transactionDescriptionAttempt)
           setTransactionDescriptions([...transactionDescriptions, {...transactionDescriptionAttempt, id: tx.id}])
          else
           setTransactionDescriptions([...transactionDescriptions, tx])
        });
    }); 
  }, [transactions]);

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
    { peerMeta && 
      (!transactionDescriptions.length
        ? (<FormItem className="py-3 space-y-3 rounded-b-xl"><p>Listening for transactions...</p></FormItem>)
        : (
          <div>
            { transactionDescriptions.map((tx, index) => {
              if ('name' in tx) return (<TransactionDescriptionRenderer key={index} {...tx} />)
              else return (<MinimalTransactionRenderer key={index} {...tx }/>)
            }
            )}
          </div>
        )
      )
    }
  </AccordionMethod>
  );
};

const TransactionDescriptionRenderer = ({name, value, args, functionFragment}: ExtendedTransactionDescription) => (
  <FormItem className="py-3 space-y-3 rounded-b-xl">
    <p><b>Decoded transaction:</b></p>
    <p>Function name: <b>{name}</b></p>
    <p>Value: {(ethers.utils.formatEther(value)).toString()} ether</p>
    <p>Args:{
      args.map((arg, argIndex) => (<p key={argIndex}>{functionFragment.inputs[argIndex].name}: {arg.toString()}</p>))
    }</p>
  </FormItem>
);

const MinimalTransactionRenderer = ({to, data, value}: MinimalTransactionInput) => (
    <FormItem className="py-3 space-y-3 rounded-b-xl">
      <p><b>Transaction could not be decoded:</b></p>
      <p>to: {to}</p>
      <p>data: {
        data.substring(0,20)+
        '...'+
        data.substring(data.length-20, data.length)
      } </p>
      <p> value: {value}</p>
    </FormItem>
)

export default WalletConnectInterceptor;


const ButtonContainer = styled.div.attrs({
  className:
    'flex justify-between tablet:justify-start p-2 tablet:p-3 space-x-2',
})``;
