import {VoteProposalStep, VoteValues} from '@aragon/sdk-client';
import {
  ExecuteProposalStep,
  IExecuteProposalParams,
  IVoteProposalParams,
} from '@aragon/sdk-client/dist/internal/interfaces/plugins';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {useParams} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useTranslation} from 'react-i18next';
import {TransactionState} from 'utils/constants';

//TODO: currently a context, but considering there will only ever be one child,
// need to turn it into a wrapper that passes props to proposal page
type ProposalTransactionContextType = {
  /** handles voting on proposal */
  handleSubmitVote: (vote: VoteValues) => void;
  handleExecuteProposal: () => void;
  pluginAddress: string;
  pluginType: PluginTypes;
  isLoading: boolean;
  voteSubmitted: boolean;
  executeSubmitted: boolean;
};

type Props = Record<'children', ReactNode>;

/**
 * This context serves as a transaction manager for proposal
 * voting and action execution
 */
const ProposalTransactionContext =
  createContext<ProposalTransactionContextType | null>(null);

const ProposalTransactionProvider: React.FC<Props> = ({children}) => {
  const {t} = useTranslation();
  const {id} = useParams();

  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);

  const [voteParams, setVoteParams] = useState<IVoteProposalParams>();
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [voteProcessState, setVoteProcessState] = useState<TransactionState>();

  const [executeParams, setExecuteParams] = useState<IExecuteProposalParams>();
  const [executeSubmitted, setExecuteSubmitted] = useState(false);
  const [executeProcessState, setExecuteProcessState] =
    useState<TransactionState>();

  const {data: daoId, isLoading: paramIsLoading} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    daoId || ''
  );

  const {pluginAddress, pluginType} = useMemo(() => {
    return {
      pluginAddress: daoDetails?.plugins[0].instanceAddress || '',
      pluginType: daoDetails?.plugins[0].id as PluginTypes,
    };
  }, [daoDetails?.plugins]);

  const pluginClient = usePluginClient(
    pluginAddress,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const shouldPollVoteFees = useMemo(
    () =>
      voteParams !== undefined && voteProcessState === TransactionState.WAITING,
    [voteParams, voteProcessState]
  );

  /*************************************************
   *                    Helpers                    *
   *************************************************/
  const handleSubmitVote = (vote: VoteValues) => {
    setVoteParams({proposalId: id!, pluginAddress, vote});
    setShowVoteModal(true);
    setVoteProcessState(TransactionState.WAITING);
  };

  // estimate voting fees
  const estimateVotingFees = useCallback(async () => {
    if (voteParams) return pluginClient?.estimation.voteProposal(voteParams);
  }, [pluginClient?.estimation, voteParams]);

  const handleExecuteProposal = () => {
    setExecuteParams({proposalId: id!, pluginAddress});
    setShowExecuteModal(true);
    setExecuteProcessState(TransactionState.WAITING);
  };

  // estimate proposal execution fees
  const estimateExecuteFees = useCallback(async () => {
    if (executeParams)
      return pluginClient?.estimation.executeProposal(executeParams);
  }, [executeParams, pluginClient?.estimation]);

  // estimation fees for voting on proposal/executing proposal
  const {tokenPrice, maxFee, averageFee, stopPolling} = usePollGasFee(
    showExecuteModal ? estimateExecuteFees : estimateVotingFees,
    shouldPollVoteFees
  );

  // handles closing vote modal
  const handleCloseVoteModal = useCallback(() => {
    switch (voteProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        {
          setShowVoteModal(false);
          setVoteSubmitted(true);
        }
        break; // TODO: reload and cache
      default: {
        setShowVoteModal(false);
        stopPolling();
      }
    }
  }, [stopPolling, voteProcessState]);

  // handles vote submission/execution
  const handleVoteExecution = useCallback(async () => {
    if (voteProcessState === TransactionState.SUCCESS) {
      handleCloseVoteModal();
      return;
    }

    if (!voteParams || voteProcessState === TransactionState.LOADING) {
      console.log('Transaction is running');
      return;
    }

    if (!pluginAddress) {
      console.error('Plugin address is required');
      return;
    }

    setVoteProcessState(TransactionState.LOADING);
    const voteSteps = pluginClient?.methods.voteProposal(voteParams);

    if (!voteSteps) {
      throw new Error('Voting function is not initialized correctly');
    }

    for await (const step of voteSteps) {
      try {
        switch (step.key) {
          case VoteProposalStep.VOTING:
            console.log(step.txHash);
            break;
          case VoteProposalStep.DONE:
            console.log(step.voteId);
            break;
        }
        setVoteParams(undefined);
        setVoteProcessState(TransactionState.SUCCESS);
      } catch (err) {
        console.error(err);
        setVoteProcessState(TransactionState.ERROR);
      }
    }
  }, [
    handleCloseVoteModal,
    pluginAddress,
    pluginClient?.methods,
    voteParams,
    voteProcessState,
  ]);

  // handles closing execute modal
  const handleCloseExecuteModal = useCallback(() => {
    switch (executeProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        {
          setShowExecuteModal(false);
          setExecuteSubmitted(true);
        }
        break; // TODO: reload and cache
      default: {
        setShowExecuteModal(false);
        stopPolling();
      }
    }
  }, [executeProcessState, stopPolling]);

  // handles proposal execution
  const handleProposalExecution = useCallback(async () => {
    if (executeProcessState === TransactionState.SUCCESS) {
      handleCloseExecuteModal();
      return;
    }
    if (!executeParams || executeProcessState === TransactionState.LOADING) {
      console.log('Transaction is running');
      return;
    }
    if (!pluginAddress) {
      console.error('Plugin address is required');
      return;
    }
    setExecuteProcessState(TransactionState.LOADING);
    const executeSteps = pluginClient?.methods.executeProposal(executeParams);
    if (!executeSteps) {
      throw new Error('Voting function is not initialized correctly');
    }
    for await (const step of executeSteps) {
      try {
        switch (step.key) {
          case ExecuteProposalStep.EXECUTING:
            console.log(step.txHash);
            break;
          case ExecuteProposalStep.DONE:
            console.log(step.key);
            break;
        }
        setExecuteParams(undefined);
        setExecuteProcessState(TransactionState.SUCCESS);
      } catch (err) {
        console.error(err);
        setExecuteProcessState(TransactionState.ERROR);
      }
    }
  }, [
    executeParams,
    executeProcessState,
    handleCloseExecuteModal,
    pluginAddress,
    pluginClient?.methods,
  ]);

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <ProposalTransactionContext.Provider
      value={{
        handleSubmitVote,
        handleExecuteProposal,
        isLoading: paramIsLoading || detailsAreLoading,
        pluginAddress,
        pluginType,
        voteSubmitted,
        executeSubmitted,
      }}
    >
      {children}
      <PublishModal
        title={showExecuteModal ? t('labels.signVote') : t('labels.signVote')}
        buttonLabel={
          showExecuteModal
            ? t('governance.proposals.buttons.execute')
            : t('governance.proposals.buttons.vote')
        }
        state={
          (showExecuteModal ? executeProcessState : voteProcessState) ||
          TransactionState.WAITING
        }
        isOpen={showVoteModal || showExecuteModal}
        onClose={
          showExecuteModal ? handleCloseExecuteModal : handleCloseVoteModal
        }
        callback={
          showExecuteModal ? handleProposalExecution : handleVoteExecution
        }
        closeOnDrag={
          showExecuteModal
            ? executeProcessState !== TransactionState.LOADING
            : voteProcessState !== TransactionState.LOADING
        }
        maxFee={maxFee}
        averageFee={averageFee}
        tokenPrice={tokenPrice}
      />
    </ProposalTransactionContext.Provider>
  );
};

function useProposalTransactionContext(): ProposalTransactionContextType {
  const context = useContext(ProposalTransactionContext);

  if (context === null) {
    throw new Error(
      'useProposalTransactionContext() can only be used on the descendants of <UseProposalTransactionProvider />'
    );
  }
  return context;
}

export {ProposalTransactionProvider, useProposalTransactionContext};
