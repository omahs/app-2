import {MultisigVotingSettings, VotingSettings} from '@aragon/sdk-client';
import React, {useCallback, useEffect, useMemo} from 'react';
import {Outlet} from 'react-router-dom';

import {Loading} from 'components/temporary';
import {GatingMenu} from 'containers/gatingMenu';
import {LoginRequired} from 'containers/walletMenu/LoginRequired';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA} from 'utils/constants';
import {formatUnits} from 'utils/library';
import {fetchBalance} from 'utils/tokens';
import {useLoginMenuContext} from 'context/loginMenu';

const ProtectedRoute: React.FC = () => {
  const {open, close, isGatingOpen} = useGlobalModalContext();
  const {address, status, isOnWrongNetwork} = useWallet();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetailsQuery();
  const {
    showLoginModal,
    handleOpenLoginModal,
    handleCloseLoginModal,
    userWentThroughLoginFlowRef,
  } = useLoginMenuContext();

  const [pluginType, pluginAddress] = useMemo(
    () => [
      daoDetails?.plugins[0].id as PluginTypes,
      daoDetails?.plugins[0].instanceAddress as string,
    ],
    [daoDetails?.plugins]
  );

  const {data: daoSettings, isLoading: settingsAreLoading} = usePluginSettings(
    pluginAddress,
    pluginType
  );

  const {
    data: {daoToken, filteredMembers},
    isLoading: membersAreLoading,
  } = useDaoMembers(pluginAddress, pluginType, address as string);

  const {network} = useNetwork();
  const {api: provider} = useProviders();

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  const gateTokenBasedProposal = useCallback(async () => {
    if (daoToken && address && filteredMembers.length === 0) {
      const balance = await fetchBalance(
        daoToken?.address,
        address,
        provider,
        CHAIN_METADATA[network].nativeCurrency
      );
      const minProposalThreshold = Number(
        formatUnits(
          (daoSettings as VotingSettings).minProposerVotingPower || 0,
          daoToken?.decimals || 18
        )
      );
      if (minProposalThreshold && Number(balance) < minProposalThreshold) {
        open('gating');
      } else close('gating');
    }
  }, [
    address,
    close,
    daoSettings,
    daoToken,
    filteredMembers.length,
    network,
    open,
    provider,
  ]);

  const gateMultisigProposal = useCallback(() => {
    if ((daoSettings as MultisigVotingSettings).onlyListed === false) {
      close('gating');
    } else if (
      !filteredMembers.some(
        mem => mem.address.toLowerCase() === address?.toLowerCase()
      ) &&
      !membersAreLoading
    ) {
      open('gating');
    } else {
      close('gating');
    }
  }, [membersAreLoading, close, daoSettings, open, address, filteredMembers]);

  /*************************************************
   *                     Effects                   *
   *************************************************/

  // wallet connected and on right network, authenticate
  useEffect(() => {
    if (status === 'connected' && !isOnWrongNetwork && pluginType) {
      if (pluginType === 'token-voting.plugin.dao.eth') {
        gateTokenBasedProposal();
      } else {
        gateMultisigProposal();
      }

      // user has gone through login flow allow them to log out in peace
      userWentThroughLoginFlowRef.current = true;
    }
  }, [
    gateMultisigProposal,
    gateTokenBasedProposal,
    isOnWrongNetwork,
    pluginType,
    status,
    userWentThroughLoginFlowRef,
  ]);

  useEffect(() => {
    // show the wallet menu only if the user hasn't gone through the flow previously
    // and is currently logged out; this allows user to log out mid flow with
    // no lasting consequences considering status will be checked upon proposal creation
    // If we want to keep user logged in (I'm in favor of), remove ref throughout component
    // Fabrice F. - [12/07/2022]
    if (!address && userWentThroughLoginFlowRef.current === false) {
      handleOpenLoginModal();
    } else {
      if (isOnWrongNetwork) open('network');
      else close('network');
    }
  }, [
    address,
    close,
    handleOpenLoginModal,
    isOnWrongNetwork,
    open,
    userWentThroughLoginFlowRef,
  ]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (detailsAreLoading || membersAreLoading || settingsAreLoading)
    return <Loading />;

  return (
    <>
      {!isGatingOpen && userWentThroughLoginFlowRef.current && <Outlet />}
      {daoDetails && (
        <GatingMenu
          daoDetails={daoDetails}
          pluginType={pluginType}
          daoToken={daoToken}
        />
      )}
      <LoginRequired isOpen={showLoginModal} onClose={handleCloseLoginModal} />
    </>
  );
};

export default ProtectedRoute;
