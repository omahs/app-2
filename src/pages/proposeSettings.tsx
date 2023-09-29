import {useReactiveVar} from '@apollo/client';
import {
  CreateMajorityVotingProposalParams,
  ProposalCreationSteps,
  VotingMode,
  VotingSettings,
} from '@aragon/sdk-client';
import {
  DaoAction,
  ProposalMetadata,
  ProposalStatus,
} from '@aragon/sdk-client-common';
import {useQueryClient} from '@tanstack/react-query';
import {parseUnits} from 'ethers/lib/utils';
import React, {useCallback, useEffect, useState} from 'react';
import {useFormContext, useFormState} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {Loading} from 'components/temporary';
import CompareSettings from 'containers/compareSettings';
import DefineProposal, {
  isValid as defineProposalIsValid,
} from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import SetupVotingForm from 'containers/setupVotingForm';
import PublishModal from 'containers/transactionModals/publishModal';
import {
  pendingMultisigProposalsVar,
  pendingTokenBasedProposalsVar,
} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {usePrivacyContext} from 'context/privacyContext';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';
import {
  PluginTypes,
  isMultisigClient,
  isTokenVotingClient,
  usePluginClient,
} from 'hooks/usePluginClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {useWallet} from 'hooks/useWallet';
import {
  isMultisigVotingSettings,
  isTokenVotingSettings,
  useVotingSettings,
} from 'services/aragon-sdk/queries/use-voting-settings';
import {AragonSdkQueryItem} from 'services/aragon-sdk/query-keys';
import {
  PENDING_MULTISIG_PROPOSALS_KEY,
  PENDING_PROPOSALS_KEY,
  TransactionState,
} from 'utils/constants';
import {
  daysToMills,
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getDHMFromSeconds,
  getSecondsFromDHM,
  hoursToMills,
  minutesToMills,
  offsetToMills,
} from 'utils/date';
import {customJSONReplacer, readFile, toDisplayEns} from 'utils/library';
import {EditSettings, Proposal, Settings} from 'utils/paths';
import {CacheProposalParams, mapToCacheProposal} from 'utils/proposals';
import {
  Action,
  ActionUpdateMetadata,
  ActionUpdateMultisigPluginSettings,
  ActionUpdatePluginSettings,
  ProposalId,
  ProposalResource,
  ProposalSettingsFormData,
} from 'utils/types';

export const ProposeSettings: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const {getValues, setValue, control} =
    useFormContext<ProposalSettingsFormData>();
  const [showTxModal, setShowTxModal] = useState(false);
  const {errors, dirtyFields} = useFormState({
    control,
  });

  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetailsQuery();
  const {data: pluginSettings, isLoading: settingsLoading} = useVotingSettings({
    pluginAddress: daoDetails?.plugins[0].instanceAddress as string,
    pluginType: daoDetails?.plugins[0].id as PluginTypes,
  });

  const enableTxModal = () => {
    setShowTxModal(true);
  };

  // filter actions making sure unchanged information is not bundled
  // into the list of actions
  const filterActions = useCallback(() => {
    const [formActions, settingsChanged, metadataChanged] = getValues([
      'actions',
      'areSettingsChanged',
      'isMetadataChanged',
    ]);

    // ignore every action that is not modifying the metadata and voting settings
    const filteredActions = (formActions as Array<Action>).filter(action => {
      if (action.name === 'modify_metadata' && metadataChanged) {
        return action;
      } else if (
        (action.name === 'modify_token_voting_settings' ||
          action.name === 'modify_multisig_voting_settings') &&
        settingsChanged
      ) {
        return action;
      }
    });

    setValue('actions', filteredActions);
  }, [getValues, setValue]);

  if (daoDetailsLoading || settingsLoading) {
    return <Loading />;
  }

  if (!pluginSettings || !daoDetails) {
    return null;
  }

  return (
    <ProposeSettingWrapper
      showTxModal={showTxModal}
      setShowTxModal={setShowTxModal}
    >
      <FullScreenStepper
        wizardProcessName={t('newProposal.title')}
        navLabel={t('navLinks.settings')}
        returnPath={generatePath(Settings, {
          network,
          dao: toDisplayEns(daoDetails.ensDomain) || daoDetails.address,
        })}
      >
        <Step
          wizardTitle={t('settings.proposeSettings')}
          wizardDescription={t('settings.proposeSettingsSubtitle')}
          onNextButtonClicked={next => {
            filterActions();
            next();
          }}
        >
          <CompareSettings />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.defineProposal.heading')}
          wizardDescription={t('newWithdraw.defineProposal.description')}
          isNextButtonDisabled={!defineProposalIsValid(dirtyFields, errors)}
        >
          <DefineProposal />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.setupVoting.title')}
          wizardDescription={t('newWithdraw.setupVoting.description')}
        >
          <SetupVotingForm pluginSettings={pluginSettings} />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.reviewProposal.heading')}
          wizardDescription={t('newWithdraw.reviewProposal.description')}
          nextButtonLabel={t('labels.submitProposal')}
          onNextButtonClicked={enableTxModal}
          fullWidth
        >
          <ReviewProposal defineProposalStepNumber={2} />
        </Step>
      </FullScreenStepper>
    </ProposeSettingWrapper>
  );
};

type Props = {
  showTxModal: boolean;
  setShowTxModal: (value: boolean) => void;
};

// TODO: this is almost identical to CreateProposal wrapper, please merge if possible
const ProposeSettingWrapper: React.FC<Props> = ({
  showTxModal,
  setShowTxModal,
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {getValues, setValue} = useFormContext();

  const {preferences} = usePrivacyContext();
  const {network} = useNetwork();
  const {address, isOnWrongNetwork} = useWallet();

  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetailsQuery();
  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  const {data: votingSettings} = useVotingSettings({pluginAddress, pluginType});

  const {
    days: minDays,
    hours: minHours,
    minutes: minMinutes,
  } = getDHMFromSeconds((votingSettings as VotingSettings)?.minDuration ?? 0);

  const {data: daoToken} = useDaoToken(pluginAddress);
  const {data: tokenSupply, isLoading: tokenSupplyIsLoading} = useTokenSupply(
    daoToken?.address || ''
  );

  const {client} = useClient();
  const pluginClient = usePluginClient(pluginType);

  const [proposalCreationData, setProposalCreationData] =
    useState<CreateMajorityVotingProposalParams>();

  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>(TransactionState.WAITING);

  const [proposalId, setProposalId] = useState<string>();

  const cachedMultisigProposals = useReactiveVar(pendingMultisigProposalsVar);
  const cachedTokenBasedProposals = useReactiveVar(
    pendingTokenBasedProposalsVar
  );

  const shouldPoll =
    creationProcessState === TransactionState.WAITING &&
    proposalCreationData !== undefined;

  const disableActionButton =
    !proposalCreationData && creationProcessState !== TransactionState.SUCCESS;

  /*************************************************
   *                     Effects                   *
   *************************************************/
  // Not a fan, but this sets the actions on the form context so that the Action
  // Widget can read them
  useEffect(() => {
    async function SetSettingActions() {
      {
        const [
          daoName,
          daoSummary,
          daoLogo,
          minimumApproval,
          multisigMinimumApprovals,
          minimumParticipation,
          eligibilityType,
          eligibilityTokenAmount,
          earlyExecution,
          voteReplacement,
          durationDays,
          durationHours,
          durationMinutes,
          resourceLinks,
          tokenDecimals,
        ] = getValues([
          'daoName',
          'daoSummary',
          'daoLogo',
          'minimumApproval',
          'multisigMinimumApprovals',
          'minimumParticipation',
          'eligibilityType',
          'eligibilityTokenAmount',
          'earlyExecution',
          'voteReplacement',
          'durationDays',
          'durationHours',
          'durationMinutes',
          'daoLinks',
          'tokenDecimals',
        ]);

        let daoLogoFile = '';

        if (daoDetails && !daoName)
          navigate(
            generatePath(EditSettings, {network, dao: daoDetails?.address})
          );

        if (daoLogo?.startsWith?.('blob'))
          daoLogoFile = (await fetch(daoLogo).then(r => r.blob())) as string;
        else daoLogoFile = daoLogo;

        const metadataAction: ActionUpdateMetadata = {
          name: 'modify_metadata',
          inputs: {
            name: daoName,
            description: daoSummary,
            avatar: daoLogoFile,
            links: resourceLinks,
          },
        };

        if (isTokenVotingSettings(votingSettings)) {
          const voteSettingsAction: ActionUpdatePluginSettings = {
            name: 'modify_token_voting_settings',
            inputs: {
              token: daoToken,
              totalVotingWeight: tokenSupply?.raw || BigInt(0),

              minDuration: getSecondsFromDHM(
                durationDays,
                durationHours,
                durationMinutes
              ),
              supportThreshold: Number(minimumApproval) / 100,
              minParticipation: Number(minimumParticipation) / 100,
              minProposerVotingPower:
                eligibilityType === 'token'
                  ? parseUnits(
                      eligibilityTokenAmount.toString(),
                      tokenDecimals
                    ).toBigInt()
                  : undefined,
              votingMode: earlyExecution
                ? VotingMode.EARLY_EXECUTION
                : voteReplacement
                ? VotingMode.VOTE_REPLACEMENT
                : VotingMode.STANDARD,
            },
          };
          setValue('actions', [metadataAction, voteSettingsAction]);
        } else {
          const multisigSettingsAction: ActionUpdateMultisigPluginSettings = {
            name: 'modify_multisig_voting_settings',
            inputs: {
              minApprovals: multisigMinimumApprovals,
              onlyListed: eligibilityType === 'multisig',
            },
          };

          setValue('actions', [metadataAction, multisigSettingsAction]);
        }
      }
    }

    SetSettingActions();
  }, [
    daoToken,
    votingSettings,
    getValues,
    setValue,
    tokenSupply?.raw,
    daoDetails,
    navigate,
    network,
  ]);

  useEffect(() => {
    // encoding actions
    const encodeActions = async (): Promise<DaoAction[]> => {
      // return an empty array for undefined clients
      const actions: Array<Promise<DaoAction>> = [];
      if (!pluginClient || !client || !daoDetails?.address)
        return Promise.all(actions);

      for (const action of getValues('actions') as Array<Action>) {
        if (action.name === 'modify_metadata') {
          const preparedAction = {...action};

          if (
            preparedAction.inputs.avatar &&
            typeof preparedAction.inputs.avatar !== 'string'
          ) {
            try {
              const daoLogoBuffer = await readFile(
                preparedAction.inputs.avatar as unknown as Blob
              );

              const logoCID = await client?.ipfs.add(
                new Uint8Array(daoLogoBuffer)
              );
              await client?.ipfs.pin(logoCID!);
              preparedAction.inputs.avatar = `ipfs://${logoCID}`;
            } catch (e) {
              preparedAction.inputs.avatar = undefined;
            }
          }

          try {
            const ipfsUri = await client.methods.pinMetadata(
              preparedAction.inputs
            );

            actions.push(
              client.encoding.updateDaoMetadataAction(
                daoDetails.address,
                ipfsUri
              )
            );
          } catch (error) {
            throw Error('Could not pin metadata on IPFS');
          }
        } else if (
          action.name === 'modify_token_voting_settings' &&
          isTokenVotingClient(pluginClient)
        ) {
          actions.push(
            Promise.resolve(
              pluginClient.encoding.updatePluginSettingsAction(
                pluginAddress,
                action.inputs
              )
            )
          );
        } else if (
          action.name === 'modify_multisig_voting_settings' &&
          isMultisigClient(pluginClient)
        ) {
          actions.push(
            Promise.resolve(
              pluginClient.encoding.updateMultisigVotingSettings({
                pluginAddress,
                votingSettings: {
                  minApprovals: action.inputs.minApprovals,
                  onlyListed: action.inputs.onlyListed,
                },
              })
            )
          );
        }
      }
      return Promise.all(actions);
    };

    const getProposalCreationParams =
      async (): Promise<CreateMajorityVotingProposalParams> => {
        const [
          title,
          summary,
          description,
          resources,
          startDate,
          startTime,
          startUtc,
          endDate,
          endTime,
          endUtc,
          durationSwitch,
          startSwitch,
        ] = getValues([
          'proposalTitle',
          'proposalSummary',
          'proposal',
          'links',
          'startDate',
          'startTime',
          'startUtc',
          'endDate',
          'endTime',
          'endUtc',
          'durationSwitch',
          'startSwitch',
        ]);

        const actions = await encodeActions();

        const metadata: ProposalMetadata = {
          title,
          summary,
          description,
          resources: resources.filter((r: ProposalResource) => r.name && r.url),
        };

        const ipfsUri = await pluginClient?.methods.pinMetadata(metadata);

        // getting dates
        let startDateTime: Date;
        const startMinutesDelay = isMultisigVotingSettings(votingSettings)
          ? 0
          : 10;

        if (startSwitch === 'now') {
          startDateTime = new Date(
            `${getCanonicalDate()}T${getCanonicalTime({
              minutes: startMinutesDelay,
            })}:00${getCanonicalUtcOffset()}`
          );
        } else {
          startDateTime = new Date(
            `${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`
          );
        }

        // End date
        let endDateTime;
        if (durationSwitch === 'duration') {
          const [days, hours, minutes] = getValues([
            'durationDays',
            'durationHours',
            'durationMinutes',
          ]);

          // Calculate the end date using duration
          const endDateTimeMill =
            startDateTime.valueOf() + offsetToMills({days, hours, minutes});

          endDateTime = new Date(endDateTimeMill);
        } else {
          endDateTime = new Date(
            `${endDate}T${endTime}:00${getCanonicalUtcOffset(endUtc)}`
          );
        }

        if (startSwitch === 'now') {
          endDateTime = new Date(
            endDateTime.getTime() + minutesToMills(startMinutesDelay)
          );
        } else {
          if (startDateTime.valueOf() < new Date().valueOf()) {
            startDateTime = new Date(
              `${getCanonicalDate()}T${getCanonicalTime({
                minutes: startMinutesDelay,
              })}:00${getCanonicalUtcOffset()}`
            );
          }

          const minEndDateTimeMills =
            startDateTime.valueOf() +
            daysToMills(minDays || 0) +
            hoursToMills(minHours || 0) +
            minutesToMills(minMinutes || 0);

          if (endDateTime.valueOf() < minEndDateTimeMills) {
            const legacyStartDate = new Date(
              `${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`
            );
            const endMills =
              endDateTime.valueOf() +
              (startDateTime.valueOf() - legacyStartDate.valueOf());

            endDateTime = new Date(endMills);
          }
        }

        /**
         * For multisig proposals, in case "now" as start time is selected, we want
         * to keep startDate undefined, so it's automatically evaluated.
         * If we just provide "Date.now()", than after user still goes through the flow
         * it's going to be date from the past. And SC-call evaluation will fail.
         */
        const finalStartDate =
          startSwitch === 'now' && isMultisigVotingSettings(votingSettings)
            ? undefined
            : startDateTime;

        // Ignore encoding if the proposal had no actions
        return {
          pluginAddress,
          metadataUri: ipfsUri || '',
          startDate: finalStartDate,
          endDate: endDateTime,
          actions,
        };
      };

    async function setProposalData() {
      if (showTxModal && creationProcessState === TransactionState.WAITING)
        setProposalCreationData(await getProposalCreationParams());
    }

    if (daoDetails?.address) {
      setProposalData();
    }
  }, [
    client,
    creationProcessState,
    daoDetails?.address,
    getValues,
    minDays,
    minHours,
    minMinutes,
    pluginAddress,
    pluginClient,
    votingSettings,
    showTxModal,
  ]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const estimateCreationFees = useCallback(async () => {
    if (!pluginClient) {
      return Promise.reject(
        new Error('ERC20 SDK client is not initialized correctly')
      );
    }
    if (!proposalCreationData) return;

    return pluginClient?.estimation.createProposal(proposalCreationData);
  }, [pluginClient, proposalCreationData]);

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateCreationFees, shouldPoll);

  const handleCloseModal = () => {
    switch (creationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(
          generatePath(Proposal, {
            network,
            dao: toDisplayEns(daoDetails?.ensDomain) || daoDetails?.address,
            id: proposalId,
          })
        );
        break;
      default: {
        setCreationProcessState(TransactionState.WAITING);
        setShowTxModal(false);
        stopPolling();
      }
    }
  };

  const invalidateQueries = useCallback(() => {
    // invalidating all infinite proposals query regardless of the
    // pagination state
    queryClient.invalidateQueries([AragonSdkQueryItem.PROPOSALS]);
  }, [queryClient]);

  const handlePublishSettings = async () => {
    if (!pluginClient) {
      return new Error('ERC20 SDK client is not initialized correctly');
    }

    // if no creation data is set, or transaction already running, do nothing.
    if (
      !proposalCreationData ||
      creationProcessState === TransactionState.LOADING
    ) {
      console.log('Transaction is running');
      return;
    }

    const proposalIterator =
      pluginClient.methods.createProposal(proposalCreationData);

    if (creationProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    setCreationProcessState(TransactionState.LOADING);
    try {
      for await (const step of proposalIterator) {
        switch (step.key) {
          case ProposalCreationSteps.CREATING:
            console.log(step.txHash);
            break;
          case ProposalCreationSteps.DONE: {
            //TODO: replace with step.proposal id when SDK returns proper format
            const proposalGuid = new ProposalId(
              step.proposalId
            ).makeGloballyUnique(pluginAddress);

            setProposalId(proposalGuid);
            setCreationProcessState(TransactionState.SUCCESS);

            // cache proposal
            handleCacheProposal(proposalGuid);
            invalidateQueries();
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
      setCreationProcessState(TransactionState.ERROR);
    }
  };

  const handleCacheProposal = useCallback(
    (proposalGuid: string) => {
      if (!address || !daoDetails || !votingSettings || !proposalCreationData)
        return;

      const [title, summary, description, resources] = getValues([
        'proposalTitle',
        'proposalSummary',
        'proposal',
        'links',
      ]);

      let cacheKey = '';
      let newCache;
      let proposalToCache;

      let proposalData: CacheProposalParams = {
        creatorAddress: address,
        daoAddress: daoDetails?.address,
        daoName: daoDetails?.metadata.name,
        proposalGuid,
        status: proposalCreationData.startDate
          ? ProposalStatus.PENDING
          : ProposalStatus.ACTIVE,
        proposalParams: {
          ...proposalCreationData,
          startDate: proposalCreationData.startDate || new Date(), // important to fallback to avoid passing undefined
        },
        metadata: {
          title,
          summary,
          description,
          resources: resources.filter((r: ProposalResource) => r.name && r.url),
        },
      };

      if (isTokenVotingSettings(votingSettings)) {
        proposalData = {
          ...proposalData,
          daoToken,
          pluginSettings: votingSettings,
          totalVotingWeight: tokenSupply?.raw,
        };

        cacheKey = PENDING_PROPOSALS_KEY;
        proposalToCache = mapToCacheProposal(proposalData);
        newCache = {
          ...cachedTokenBasedProposals,
          [daoDetails.address]: {
            ...cachedTokenBasedProposals[daoDetails.address],
            [proposalGuid]: {...proposalToCache},
          },
        };
        pendingTokenBasedProposalsVar(newCache);
      } else if (isMultisigVotingSettings(votingSettings)) {
        proposalData.minApprovals = votingSettings.minApprovals;
        proposalData.onlyListed = votingSettings.onlyListed;
        cacheKey = PENDING_MULTISIG_PROPOSALS_KEY;
        proposalToCache = mapToCacheProposal(proposalData);
        newCache = {
          ...cachedMultisigProposals,
          [daoDetails.address]: {
            ...cachedMultisigProposals[daoDetails.address],
            [proposalGuid]: {...proposalToCache},
          },
        };
        pendingMultisigProposalsVar(newCache);
      }

      // persist new cache if functional cookies enabled
      if (preferences?.functional) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify(newCache, customJSONReplacer)
        );
      }
    },
    [
      address,
      cachedMultisigProposals,
      cachedTokenBasedProposals,
      daoDetails,
      daoToken,
      getValues,
      votingSettings,
      preferences?.functional,
      proposalCreationData,
      tokenSupply?.raw,
    ]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (daoDetailsLoading || tokenSupplyIsLoading) {
    return <Loading />;
  }

  return (
    <>
      {children}
      <PublishModal
        state={creationProcessState || TransactionState.WAITING}
        isOpen={showTxModal}
        onClose={handleCloseModal}
        callback={handlePublishSettings}
        closeOnDrag={creationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
        title={t('TransactionModal.createProposal')}
        buttonLabel={t('TransactionModal.createProposalNow')}
        buttonLabelSuccess={t('TransactionModal.launchGovernancePage')}
        disabledCallback={disableActionButton}
      />
    </>
  );
};
