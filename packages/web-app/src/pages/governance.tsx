import React from 'react';
import {withTransaction} from '@elastic/apm-rum-react';

import {CardProposal} from '@aragon/ui-components';

const Governance: React.FC = () => {
  return (
    <>
      <CardProposal
        title={''}
        description={''}
        onClick={() => null}
        state={'draft'}
        voteTitle={''}
        publishLabel={''}
        buttonLabel={[]}
        AlertMessage={[]}
        StatusLabel={[]}
      />
    </>
  );
};

export default withTransaction('Governance', 'component')(Governance);
