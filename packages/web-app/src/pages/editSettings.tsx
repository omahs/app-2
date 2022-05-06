import React from 'react';
import {withTransaction} from '@elastic/apm-rum-react';
import {useTranslation} from 'react-i18next';

const EditSettings: React.FC = () => {
  const {t} = useTranslation();

  return <p>Edit Settings</p>;
};

export default withTransaction('EditSettings', 'component')(EditSettings);
