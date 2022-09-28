import {withTransaction} from '@elastic/apm-rum-react';
import React, {useEffect, useState} from 'react';
import {useForm, FormProvider} from 'react-hook-form';

import {ActionsProvider} from 'context/actions';
import {useDaoParam} from 'hooks/useDaoParam';
import {Loading} from 'components/temporary';
import {CreateProposalProvider} from 'context/createProposal';
import ProposalStepper from 'containers/proposalStepper';
import {TokenGating} from 'containers/gatingMenu/tokenGating';
import {WalletGating} from 'containers/gatingMenu/walletGating';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useWalletCanVote} from 'hooks/useWalletCanVote';
import {PluginTypes} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {useParams} from 'react-router-dom';
import {useGlobalModalContext} from 'context/globalModals';

const NewProposal: React.FC = () => {
  const {data: dao, isLoading} = useDaoParam();
  const [showTxModal, setShowTxModal] = useState(false);
  const {id} = useParams();
  const {address} = useWallet();
  const {open} = useGlobalModalContext();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    dao || ''
  );

  const {data: canVote} = useWalletCanVote(
    address,
    id || '',
    daoDetails?.plugins[0].instanceAddress || '',
    daoDetails?.plugins[0].id as PluginTypes
  );

  useEffect(() => {
    if (!canVote && daoDetails)
      open(
        daoDetails?.plugins[0].id === 'erc20voting.dao.eth'
          ? 'requiredToken'
          : 'requiredWallet'
      );
  }, [canVote, daoDetails, daoDetails?.plugins, open]);

  const formMethods = useForm({
    mode: 'onChange',
  });

  const enableTxModal = () => {
    setShowTxModal(true);
  };

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (isLoading && detailsAreLoading) {
    return <Loading />;
  }

  return (
    <FormProvider {...formMethods}>
      <ActionsProvider daoId={dao}>
        <CreateProposalProvider
          showTxModal={showTxModal}
          setShowTxModal={setShowTxModal}
        >
          <ProposalStepper enableTxModal={enableTxModal} />
          <TokenGating />
          <WalletGating />
        </CreateProposalProvider>
      </ActionsProvider>
    </FormProvider>
  );
};

export default withTransaction('NewProposal', 'component')(NewProposal);
