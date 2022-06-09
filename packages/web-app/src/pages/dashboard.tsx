import React from 'react';
import styled from 'styled-components';
import {withTransaction} from '@elastic/apm-rum-react';

import {Loading} from 'components/temporary';
import {useDaoParam} from 'hooks/useDaoParam';
import ProposalSnapshot from 'containers/proposalSnapshot';
import TreasurySnapshot from 'containers/treasurySnapshot';
import {HeaderDao} from '@aragon/ui-components';
import {MembershipSnapshot} from 'containers/membershipSnapshot';

const Dashboard: React.FC = () => {
  const {data: dao, loading} = useDaoParam();

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <HeaderWrapper>
        <HeaderDao
          daoName={'DaoName'}
          description={
            'We are a community that loves trees and the planet. We track where forestation is increasing (or shrinking), fund people who are growing and protecting trees...'
          }
          created_at={'March 2022'}
          daoChain={'Arbitrum'}
          daoType={'Wallet Based'}
          links={[
            {
              label: 'Website',
              href: 'https://google.com',
            },
            {
              label: 'Discord',
              href: 'https://google.com',
            },
            {
              label: 'Forum',
              href: 'https://google.com',
            },
          ]}
        />
      </HeaderWrapper>
      <LeftContent>
        <ProposalSnapshot dao={dao} />
      </LeftContent>
      <RightContent>
        <TreasurySnapshot dao={dao} />
        <MembershipSnapshot dao={dao} />
      </RightContent>
    </>
  );
};

export default withTransaction('Dashboard', 'component')(Dashboard);

const HeaderWrapper = styled.div.attrs({
  className: 'w-screen -mx-2 tablet:col-span-full tablet:w-full tablet:mx-0',
})``;

const LeftContent = styled.div.attrs({
  className: 'col-span-full desktop:col-start-2 desktop:col-span-6',
})``;

const RightContent = styled.div.attrs({
  className:
    'col-span-full space-y-2 desktop:col-start-8 desktop:col-span-4 desktop:space-y-3',
})``;
