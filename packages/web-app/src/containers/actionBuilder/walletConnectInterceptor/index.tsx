import {
  ButtonIcon,
  ButtonText,
  Dropdown,
  IconMenuVertical,
  Label,
  ListItemAction,
  StateEmpty,
} from '@aragon/ui-components';
import React, {useEffect, useState, useCallback, MouseEvent, SyntheticEvent} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
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

type RemoveAddressesProps = ActionIndex & CustomHeaderProps;

const WalletConnectInterceptor: React.FC<RemoveAddressesProps> = ({
  actionIndex,
  useCustomHeader = false,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {data: dao} = useDaoParam();
  const { wcClientData, wcConnect, wcDisconnect, transaction } = useWalletConnect();
  const [isConnecting, setIsConnecting] = useState(false)
  const [uri, setUri] = useState('')
  
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUri(event.target.value)
  }
  
  const connectDAO = (event: MouseEvent) => {
    event.preventDefault();
    wcConnect(uri, dao);
  }

  return (
    <>
    <div>
    <input
     type="text"
     name="name"
     onChange={onChangeHandler}
     value={uri}
    />
    <button onClick={connectDAO}>Connect</button>
    { transaction && (
      <p>data: {transaction.data}, to: {transaction.to}, value: {transaction.value}</p>
    )}
    </div>
    </>
  );
};

export default WalletConnectInterceptor;
