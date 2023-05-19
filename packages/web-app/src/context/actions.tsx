import {useApolloClient} from '@apollo/client';
import {
  DaoAction,
  MultisigClient,
  ProposalStatus,
  TokenVotingClient,
  TokenVotingProposal,
} from '@aragon/sdk-client';
import {Address} from '@aragon/ui-components/dist/utils/addresses';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {useProposals} from 'hooks/useProposals';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import {useFieldArray, useFormContext} from 'react-hook-form';
import {
  decodeAddMembersToAction,
  decodeMetadataToAction,
  decodeMintTokensToAction,
  decodeMultisigSettingsToAction,
  decodePluginSettingsToAction,
  decodeRemoveMembersToAction,
  decodeWithdrawToAction,
} from 'utils/library';

import {Action, ActionItem, DetailedProposal} from 'utils/types';
import {useSpecificProvider} from './providers';
import {CHAIN_METADATA} from 'utils/constants';
import {useNetwork} from './network';
import {isErc20VotingProposal} from 'utils/proposals';
import {getEtherscanVerifiedContract} from 'services/etherscanAPI';
import {addABI, decodeMethod} from 'utils/abiDecoder';
import {bytesToHex} from '@aragon/sdk-common';

const ActionsContext = createContext<ActionsContextType | null>(null);

type ActionsContextType = {
  daoAddress: Address;
  actions: ActionItem[];
  selectedActionIndex: number;
  setSelectedActionIndex: React.Dispatch<React.SetStateAction<number>>;
  addAction: (value: ActionItem) => void;
  duplicateAction: (index: number) => void;
  removeAction: (index: number) => void;
};

type ActionsProviderProps = {
  daoId: Address;
};

const ActionsProvider: React.FC<ActionsProviderProps> = ({daoId, children}) => {
  const [actions, setActions] = useState<ActionsContextType['actions']>([]);
  const [selectedActionIndex, setSelectedActionIndex] =
    useState<ActionsContextType['selectedActionIndex']>(0);

  const {control} = useFormContext();
  const {remove} = useFieldArray({control, name: 'actions'});

  const {client} = useClient();
  const apolloClient = useApolloClient();
  const {network} = useNetwork();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);
  const {data: daoDetails} = useDaoDetailsQuery();
  const {data: activeProposals, isLoading: isActiveProposalsLoading} =
    useProposals(
      daoDetails?.address as string,
      daoDetails?.plugins[0].id as PluginTypes,
      100,
      0,
      ProposalStatus.ACTIVE
    );
  const {data: pendingProposals, isLoading: isPendingProposalsLoading} =
    useProposals(
      daoDetails?.address as string,
      daoDetails?.plugins[0].id as PluginTypes,
      100,
      0,
      ProposalStatus.PENDING
    );
  const {data: succeededProposals, isLoading: isSucceededProposalsLoading} =
    useProposals(
      daoDetails?.address as string,
      daoDetails?.plugins[0].id as PluginTypes,
      100,
      0,
      ProposalStatus.SUCCEEDED
    );

  const pluginClient = usePluginClient(
    daoDetails?.plugins[0].id as PluginTypes
  );

  const [isMintProposalExist, setIsMintProposalExist] = useState(false);

  useEffect(() => {
    if (
      isActiveProposalsLoading ||
      isPendingProposalsLoading ||
      isSucceededProposalsLoading ||
      !pluginClient ||
      !daoDetails
    ) {
      return;
    }

    const proposalsPreviews = [
      ...activeProposals,
      ...pendingProposals,
      ...succeededProposals,
    ];

    async function loadProposals() {
      const proposalsPromises = proposalsPreviews.map(item =>
        pluginClient?.methods?.getProposal(item.id)
      );

      try {
        const result = await Promise.all(proposalsPromises);
        const onlyProposals = result.filter(
          item => !!item
        ) as DetailedProposal[];

        const actionsPromises = onlyProposals.map(proposal => {
          const mintTokenActions: {
            actions: Uint8Array[];
            index: number;
          } = {actions: [], index: 0};

          const proposalErc20Token = isErc20VotingProposal(proposal)
            ? proposal.token
            : undefined;

          const decodedActionsPromises = proposal.actions.map(
            (action: DaoAction, index) => {
              const functionParams =
                client?.decoding.findInterface(action.data) ||
                pluginClient?.decoding.findInterface(action.data);

              switch (functionParams?.functionName) {
                case 'transfer':
                  return decodeWithdrawToAction(
                    action.data,
                    client,
                    apolloClient,
                    provider,
                    network,
                    action.to,
                    action.value
                  );
                case 'mint':
                  if (mintTokenActions.actions.length === 0) {
                    mintTokenActions.index = index;
                  }
                  mintTokenActions.actions.push(action.data);
                  return Promise.resolve({} as Action);
                case 'addAddresses':
                  return decodeAddMembersToAction(
                    action.data,
                    pluginClient as MultisigClient
                  );
                case 'removeAddresses':
                  return decodeRemoveMembersToAction(
                    action.data,
                    pluginClient as MultisigClient
                  );
                case 'updateVotingSettings':
                  return decodePluginSettingsToAction(
                    action.data,
                    pluginClient as TokenVotingClient,
                    (proposal as TokenVotingProposal)
                      .totalVotingWeight as bigint,
                    proposalErc20Token
                  );
                case 'updateMultisigSettings':
                  return Promise.resolve(
                    decodeMultisigSettingsToAction(
                      action.data,
                      pluginClient as MultisigClient
                    )
                  );
                case 'setMetadata':
                  return decodeMetadataToAction(action.data, client);
                default:
                  return getEtherscanVerifiedContract(action.to, network).then(
                    etherscanData => {
                      if (
                        etherscanData.status === '1' &&
                        etherscanData.result[0].ABI !==
                          'Contract source code not verified'
                      ) {
                        addABI(JSON.parse(etherscanData.result[0].ABI));
                        const decodedData = decodeMethod(
                          bytesToHex(action.data)
                        );

                        if (decodedData) {
                          return {
                            name: 'external_contract_action',
                            contractAddress: action.to,
                            contractName: etherscanData.result[0].ContractName,
                            functionName: decodedData.name,
                            inputs: decodedData.params,
                          };
                        }
                      }
                    }
                  );
              }
            }
          );

          if (proposalErc20Token && mintTokenActions.actions.length !== 0) {
            // Decode all the mint actions into one action with several addresses
            const decodedMintToken = decodeMintTokensToAction(
              mintTokenActions.actions,
              pluginClient as TokenVotingClient,
              proposalErc20Token.address,
              (proposal as TokenVotingProposal).totalVotingWeight,
              provider,
              network
            );

            // splice them back to the actions array with all the other actions
            decodedActionsPromises.splice(
              mintTokenActions.index,
              mintTokenActions.actions.length,
              decodedMintToken as any
            );
          }

          return Promise.all(decodedActionsPromises);
        });

        const actionsResult = await Promise.all(actionsPromises);

        let isMintActionExists = false;

        actionsResult.forEach(items => {
          items.forEach(actionItem => {
            if (actionItem?.name === 'mint_tokens') {
              isMintActionExists = true;
            }
          });
        });

        console.log(onlyProposals);
        console.log(actionsResult);

        setIsMintProposalExist(isMintActionExists);
      } catch (err) {
        console.error(err);
      }
    }

    loadProposals();
  }, [
    activeProposals,
    apolloClient,
    client,
    daoDetails,
    isActiveProposalsLoading,
    isPendingProposalsLoading,
    isSucceededProposalsLoading,
    network,
    pendingProposals,
    pluginClient,
    provider,
    succeededProposals,
  ]);

  const addAction = useCallback(
    newAction => {
      if (isMintProposalExist) {
        alert('Minting action exsits!');
      }

      setActions(oldActions => {
        if (
          (newAction.name === 'remove_address' ||
            newAction.name === 'add_address') &&
          !oldActions.some(a => a.name === 'modify_multisig_voting_settings')
        ) {
          return [
            ...oldActions,
            newAction,
            {name: 'modify_multisig_voting_settings'},
          ];
        }

        return [...oldActions, newAction];
      });
    },
    [isMintProposalExist]
  );

  const removeAction = useCallback(
    (index: number) => {
      let newActions = actions.filter((_, oldIndex) => oldIndex !== index);

      if (
        // check if there is an update settings with min approval
        newActions.some(a => a.name === 'modify_multisig_voting_settings') &&
        // and no add or remove action is present
        !newActions.some(
          a => a.name === 'remove_address' || a.name === 'add_address'
        )
      ) {
        const indexOfMinApproval = newActions.findIndex(
          a => a.name === 'modify_multisig_voting_settings'
        );

        // remove from local context
        newActions = newActions.filter(
          (_, oldIndex) => oldIndex !== indexOfMinApproval
        );

        // remove from form
        remove(indexOfMinApproval);
      }

      // update local context
      setActions(newActions);

      // update form actions
      remove(index);
    },
    [actions, remove]
  );

  const duplicateAction = useCallback((index: number) => {
    setActions((oldActions: ActionsContextType['actions']) => [
      ...oldActions,
      oldActions[index],
    ]);
  }, []);

  const value = useMemo(
    (): ActionsContextType => ({
      daoAddress: daoId,
      actions,
      addAction,
      removeAction,
      duplicateAction,
      selectedActionIndex,
      setSelectedActionIndex,
    }),
    [
      daoId,
      actions,
      addAction,
      removeAction,
      duplicateAction,
      selectedActionIndex,
    ]
  );

  return (
    <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
  );
};

function useActionsContext(): ActionsContextType {
  return useContext(ActionsContext) as ActionsContextType;
}

export {useActionsContext, ActionsProvider};
