import React from 'react';
import {Outlet} from 'react-router-dom';

import {useGlobalModalContext} from 'context/globalModals';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {useWallet} from 'hooks/useWallet';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {Loading} from 'components/temporary';
import {GatingMenu} from 'containers/gatingMenu';

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
    open('gating');
  }

  return (
    <>
      <Outlet />
      <GatingMenu pluginType={daoDetails?.plugins[0].id as PluginTypes} />
    </>
  );
};

export default ProtectedRoute;
