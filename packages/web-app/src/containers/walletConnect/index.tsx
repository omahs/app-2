import React, {useCallback, useState} from 'react';

import EmptyState from './emptyStateModal';
import {useActionsContext} from 'context/actions';

type WalletConnectProps = {
  actionIndex: number;
};

const WalletConnect: React.FC<WalletConnectProps> = ({actionIndex}) => {
  const {removeAction} = useActionsContext();

  const [emptyStateIsOpen, setEmptyStateIsOpen] = useState(true);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleCloseEmptyState = useCallback(() => {
    setEmptyStateIsOpen(false);
    removeAction(actionIndex);
  }, [actionIndex, removeAction]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  return (
    <EmptyState
      isOpen={emptyStateIsOpen}
      onClose={handleCloseEmptyState}
      onBackButtonClicked={handleCloseEmptyState}
      onCtaClicked={() => null}
    />
  );
};

export default WalletConnect;
