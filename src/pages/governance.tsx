import {ProposalStatus} from '@aragon/sdk-client-common';
import {
  ButtonGroup,
  ButtonText,
  IconAdd,
  IconChevronDown,
  Option,
  Spinner,
  IllustrationHuman,
} from '@aragon/ods';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import ProposalList from 'components/proposalList';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PluginTypes} from 'hooks/usePluginClient';
import {useProposals} from 'hooks/useProposals';
import {trackEvent} from 'services/analytics';
import {ProposalListItem} from 'utils/types';
import PageEmptyState from 'containers/pageEmptyState';
import {toDisplayEns} from 'utils/library';
import useScreen from 'hooks/useScreen';
import {htmlIn} from 'utils/htmlIn';
import uniqBy from 'lodash/uniqBy';
import {useGlobalModalContext} from 'context/globalModals';
import {featureFlags} from 'utils/featureFlags';

// The number of proposals displayed on each page
const PROPOSALS_PER_PAGE = 6;

export const Governance: React.FC = () => {
  const {data: daoDetails, isLoading: isDaoLoading} = useDaoDetailsQuery();
  const {isMobile} = useScreen();
  const {open} = useGlobalModalContext();

  const [skip, setSkip] = useState(0);
  const [endReached, setEndReached] = useState(false);
  const [filterValue, setFilterValue] = useState<ProposalStatus | 'All'>('All');

  const isTokenBasedDao =
    daoDetails?.plugins[0].id === 'token-voting.plugin.dao.eth';
  const enableDelegation =
    isTokenBasedDao &&
    featureFlags.getValue('VITE_FEATURE_FLAG_DELEGATION') === 'true';

  const {
    data: proposals,
    isInitialLoading,
    isLoading,
    isLoadingMore,
  } = useProposals(
    daoDetails?.address as string,
    daoDetails?.plugins[0].id as PluginTypes,
    PROPOSALS_PER_PAGE,
    skip,
    filterValue !== 'All' ? filterValue : undefined
  );

  const [displayedProposals, setDisplayedProposals] = useState<
    ProposalListItem[]
  >([]);

  useEffect(() => {
    if (!isInitialLoading) {
      if (!proposals.length) {
        setEndReached(true);
      }

      setDisplayedProposals(prev => {
        const resultProposals = [...(prev || []), ...proposals];
        return uniqBy(resultProposals, 'id');
      });
    }
  }, [isInitialLoading, proposals]);

  const {t} = useTranslation();
  const navigate = useNavigate();

  const handleNewProposalClick = () => {
    trackEvent('governance_newProposalBtn_clicked', {
      dao_address: daoDetails?.address as string,
    });
    navigate('new-proposal');
  };

  const handleShowMoreClick = () => {
    if (!isDaoLoading) setSkip(prev => prev + PROPOSALS_PER_PAGE);
  };

  if (isInitialLoading) {
    return <Loading />;
  }

  if (
    !isInitialLoading &&
    !isLoading &&
    !displayedProposals?.length &&
    filterValue === 'All'
  ) {
    return (
      <PageEmptyState
        title={t('governance.emptyState.title')}
        subtitle={htmlIn(t)('governance.emptyState.subtitle')}
        Illustration={
          <IllustrationHuman
            {...{
              body: 'voting',
              expression: 'smile',
              hair: 'middle',
              accessory: 'earrings_rhombus',
              sunglass: 'big_rounded',
            }}
            {...(isMobile
              ? {height: 165, width: 295}
              : {height: 225, width: 400})}
          />
        }
        primaryButton={{
          label: t('newProposal.title'),
          onClick: handleNewProposalClick,
        }}
        secondaryButton={
          enableDelegation
            ? {
                label: t('governance.actionSecondary'),
                onClick: () => open('delegateVoting'),
              }
            : undefined
        }
      />
    );
  }

  return (
    <>
      <PageWrapper
        title={'Proposals'}
        primaryBtnProps={{
          label: t('governance.action'),
          iconLeft: <IconAdd />,
          onClick: () => {
            trackEvent('governance_newProposalBtn_clicked', {
              dao_address: daoDetails?.address,
            });
            navigate('new-proposal');
          },
        }}
        secondaryBtnProps={
          enableDelegation
            ? {
                label: t('governance.actionSecondary'),
                onClick: () => open('delegateVoting'),
              }
            : undefined
        }
      >
        <ButtonGroupContainer>
          <ButtonGroup
            bgWhite
            defaultValue={filterValue}
            onChange={(selected: string) => {
              setFilterValue(selected as ProposalStatus | 'All');
              setDisplayedProposals([]);
              setSkip(0);
              setEndReached(false);
            }}
          >
            <Option value="All" label="All" />
            <Option value="Pending" label="Pending" />
            <Option value="Active" label="Active" />
            <Option value="Succeeded" label="Succeeded" />
            <Option value="Executed" label="Executed" />
            <Option value="Defeated" label="Defeated" />
          </ButtonGroup>
        </ButtonGroupContainer>
        <ListWrapper>
          <ProposalList
            daoAddressOrEns={
              toDisplayEns(daoDetails?.ensDomain) ||
              (daoDetails?.address as string)
            }
            proposals={displayedProposals}
            pluginAddress={daoDetails?.plugins[0].instanceAddress as string}
            pluginType={daoDetails?.plugins[0].id as PluginTypes}
            isLoading={isLoading}
          />
        </ListWrapper>

        {!endReached && displayedProposals?.length > 0 && (
          <div className="mt-3">
            <ButtonText
              label={t('explore.explorer.showMore')}
              iconRight={
                isLoadingMore ? <Spinner size="xs" /> : <IconChevronDown />
              }
              bgWhite
              mode="ghost"
              onClick={handleShowMoreClick}
            />
          </div>
        )}
      </PageWrapper>
    </>
  );
};

export const Container = styled.div.attrs({
  className: 'col-span-full desktop:col-start-3 desktop:col-end-11',
})``;

const ButtonGroupContainer = styled.div.attrs({
  className: 'flex overflow-auto mt-3 desktop:mt-8',
})`
  scrollbar-width: none;

  ::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
`;

const ListWrapper = styled.div.attrs({
  className: 'mt-3',
})``;
