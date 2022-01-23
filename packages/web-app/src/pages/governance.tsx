import React, {useState} from 'react';
import {withTransaction} from '@elastic/apm-rum-react';
import {Option, ButtonGroup, SearchInput} from '@aragon/ui-components';
import styled from 'styled-components';

import {PageWrapper} from 'components/wrappers';
import type {Proposal} from 'utils/types';
import ProposalList from 'components/proposalList';

const TEMP_PROPOSALS: Proposal[] = [
  {
    type: 'draft',
    title: 'Title',
    description: 'Description',
    publisherAddress: '0x374d444487A4602750CA00EFdaC5d22B21F130E1',
    winningPercentage: 30,
  },
  {
    type: 'draft',
    title: 'Title',
    description: 'Description',
    publisherAddress: '0x374d444487A4602750CA00EFdaC5d22B21F130E1',
    winningPercentage: 30,
  },
  {
    type: 'draft',
    title: 'Title',
    description: 'Description',
    publisherAddress: '0x374d444487A4602750CA00EFdaC5d22B21F130E1',
    winningPercentage: 30,
  },
];

const Governance: React.FC = () => {
  const [filterValue, setFilterValue] = useState<string>('all');
  let displayedProposals: Proposal[] = [];

  if (filterValue) {
    displayedProposals = TEMP_PROPOSALS.filter(
      t => t.type === filterValue || filterValue === 'all'
    );
  }

  return (
    <Container>
      <PageWrapper
        title={'Proposals'}
        buttonLabel={'New Proposal'}
        subtitle={'1 active Proposal'}
        onClick={() => null}
      >
        <div className="mt-8 space-y-1.5">
          <SearchInput placeholder="Type to filter" />
          <ButtonGroup
            bgWhite
            defaultValue="all"
            onChange={(selected: string) => setFilterValue(selected)}
          >
            <Option value="all" label="All" />
            <Option value="draft" label="Draft" />
            <Option value="pending" label="Pending" />
            <Option value="active" label="Active" />
            <Option value="succeeded" label="Succeeded" />
            <Option value="executed" label="Executed" />
            <Option value="defeated" label="Defeated" />
          </ButtonGroup>
        </div>
        <ListWrapper>
          <ProposalList proposals={displayedProposals} />
        </ListWrapper>
      </PageWrapper>
    </Container>
  );
};

export default withTransaction('Governance', 'component')(Governance);

const Container = styled.div.attrs({
  className: 'm-auto mt-4 w-8/12',
})``;

const ListWrapper = styled.div.attrs({
  className: 'mt-3',
})``;
