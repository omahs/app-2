import {useReactiveVar} from '@apollo/client';
import {useCallback, useEffect, useState} from 'react';

import {
  PendingMultisigApprovals,
  pendingMultisigApprovalsVar,
  PendingMultisigExecution,
  pendingMultisigExecutionVar,
  pendingMultisigProposalsVar,
  PendingTokenBasedExecution,
  pendingTokenBasedExecutionVar,
  pendingTokenBasedProposalsVar,
  PendingTokenBasedVotes,
  pendingTokenBasedVotesVar,
} from 'context/apolloClient';
import {usePrivacyContext} from 'context/privacyContext';
import {
  PENDING_EXECUTION_KEY,
  PENDING_MULTISIG_EXECUTION_KEY,
  PENDING_MULTISIG_PROPOSALS_KEY,
  PENDING_PROPOSALS_KEY,
} from 'utils/constants';
import {customJSONReplacer} from 'utils/library';
import {
  augmentProposalWithCachedExecution,
  augmentProposalWithCachedVote,
  isMultisigProposal,
  isTokenBasedProposal,
  recalculateStatus,
} from 'utils/proposals';
import {DetailedProposal, HookData, ProposalId} from 'utils/types';
import {useDaoDetailsQuery} from './useDaoDetails';
import {useDaoToken} from './useDaoToken';
import {PluginTypes, usePluginClient} from './usePluginClient';

/**
 * Retrieve a single detailed proposal
 * @param daoAddress address used to create unique proposal id
 * @param proposalId id of proposal to retrieve
 * @param pluginType plugin type
 * @param pluginAddress plugin address
 * @returns a detailed proposal
 */
export const useDaoProposal = (
  daoAddress: string,
  proposalId: ProposalId | undefined,
  pluginType: PluginTypes,
  pluginAddress: string,
  intervalInMills?: number
): HookData<DetailedProposal | undefined> => {
  // TODO: please remove daoAddress when refactoring to react-query based query
  const [data, setData] = useState<DetailedProposal>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const [numberOfRuns, setNumberOfRuns] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer>();

  const pluginClient = usePluginClient(pluginType);
  const {preferences} = usePrivacyContext();

  // todo(kon): implement this for offchain proposals

  const {data: daoDetails} = useDaoDetailsQuery();
  const {data: daoToken} = useDaoToken(
    daoDetails?.plugins[0].instanceAddress || ''
  );

  const cachedMultisigVotes = useReactiveVar(pendingMultisigApprovalsVar);
  const cachedTokenBasedVotes = useReactiveVar(pendingTokenBasedVotesVar);

  const cachedMultisigProposals = useReactiveVar(pendingMultisigProposalsVar);
  const cachedTokenBasedProposals = useReactiveVar(
    pendingTokenBasedProposalsVar
  );

  const cachedMultisigExecutions = useReactiveVar(pendingMultisigExecutionVar);
  const cachedTokenBaseExecutions = useReactiveVar(
    pendingTokenBasedExecutionVar
  );

  const proposalGuid = proposalId?.makeGloballyUnique(pluginAddress);
  const isMultisigPlugin = pluginType === 'multisig.plugin.dao.eth';
  const isTokenBasedPlugin = pluginType === 'token-voting.plugin.dao.eth';

  // return cache keys and variables based on the type of plugin;
  const getCachedProposalData = useCallback(
    (proposalGuid: string) => {
      if (pluginType === 'multisig.plugin.dao.eth') {
        return {
          proposalCacheKey: PENDING_MULTISIG_PROPOSALS_KEY,
          proposalCacheVar: pendingMultisigProposalsVar,
          proposalCache: cachedMultisigProposals,
          proposal: cachedMultisigProposals[daoAddress]?.[proposalGuid],
          votes: cachedMultisigVotes,
          executions: cachedMultisigExecutions,
        };
      }

      // token voting
      if (pluginType === 'token-voting.plugin.dao.eth') {
        return {
          proposalCacheKey: PENDING_PROPOSALS_KEY,
          proposalCacheVar: pendingTokenBasedProposalsVar,
          proposalCache: cachedTokenBasedProposals,
          proposal: cachedTokenBasedProposals[daoAddress]?.[proposalGuid],
          votes: cachedTokenBasedVotes,
          executions: cachedTokenBaseExecutions,
        };
      }
    },
    [
      cachedMultisigExecutions,
      cachedMultisigProposals,
      cachedMultisigVotes,
      cachedTokenBaseExecutions,
      cachedTokenBasedProposals,
      cachedTokenBasedVotes,
      daoAddress,
      pluginType,
    ]
  );

  useEffect(() => {
    if ((intervalInMills || 0) > 0) {
      setNumberOfRuns(value => value + 1);

      const id = setInterval(() => {
        setNumberOfRuns(value => value + 1);
      }, intervalInMills);

      setIntervalId(id);
    } else {
      clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
    };
    // This effect only runs when intervalInMills will changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalInMills]);

  useEffect(() => {
    const getDaoProposal = async (proposalGuid: string) => {
      const cacheData = getCachedProposalData(proposalGuid);

      try {
        // Do not show loader if page is already loaded
        if (numberOfRuns === 0) {
          setIsLoading(true);
        }

        let proposal = recalculateStatus(
          await pluginClient?.methods.getProposal(proposalGuid)
        );

        if (isTokenBasedProposal(proposal)) {
          proposal = {
            ...proposal,
            token: proposal.token || daoToken || null,
          };
        }

        if (proposal && cacheData) {
          setData(
            // add cached executions and votes to the fetched proposal
            getAugmentedProposal(
              proposal,
              daoAddress,
              cacheData.executions,
              cacheData.votes,
              preferences?.functional
            )
          );

          // remove cached proposal if it exists
          if (cacheData.proposal) {
            const newCache = {...cacheData.proposalCache};
            delete newCache[daoAddress][proposalGuid];

            // update new values
            cacheData.proposalCacheVar(newCache);

            if (preferences?.functional) {
              localStorage.setItem(
                cacheData.proposalCacheKey,
                JSON.stringify(newCache, customJSONReplacer)
              );
            }
          }
        } else if (cacheData?.proposal) {
          // proposal is not yet indexed but is in the cache, augment it
          // with cached votes and execution
          setData(
            getAugmentedProposal(
              cacheData.proposal as DetailedProposal,
              daoAddress,
              cacheData.executions,
              cacheData.votes,
              preferences?.functional
            )
          );
        }
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (
      daoAddress &&
      proposalGuid &&
      (isMultisigPlugin || (isTokenBasedPlugin && daoToken))
    )
      getDaoProposal(proposalGuid);
  }, [
    daoAddress,
    getCachedProposalData,
    pluginClient?.methods,
    pluginType,
    preferences?.functional,
    proposalGuid,
    pluginAddress,
    numberOfRuns,
    daoToken,
    isMultisigPlugin,
    isTokenBasedPlugin,
  ]);

  return {data, error, isLoading};
};
