import React from 'react';
import {Outlet} from 'react-router-dom';

import {useGlobalModalContext} from 'context/globalModals';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {useWallet} from 'hooks/useWallet';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {Loading} from 'components/temporary';
import {TokenGating} from 'containers/gatingMenu/tokenGating';
import {WalletGating} from 'containers/gatingMenu/walletGating';

const ProtectedRoute: React.FC = () => {
  const {data: dao, isLoading: paramIsLoading} = useDaoParam();
  const {address, isConnected} = useWallet();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    dao || ''
  );
  const {open} = useGlobalModalContext();
  const {
    data: {filteredMembers},
    isLoading: MembershipIsLoading,
  } = useDaoMembers(
    daoDetails?.plugins[0].instanceAddress || '',
    daoDetails?.plugins[0].id as PluginTypes,
    address as string
  );

  if (paramIsLoading || detailsAreLoading || MembershipIsLoading)
    return <Loading />;

  if (filteredMembers.length === 0 && daoDetails && isConnected) {
    open(
      daoDetails?.plugins[0].id === 'erc20voting.dao.eth'
        ? 'requiredToken'
        : 'requiredWallet'
    );
  }

  return (
    <>
      <Outlet />
      <TokenGating />
      <WalletGating />
    </>
  );
};

export default ProtectedRoute;
