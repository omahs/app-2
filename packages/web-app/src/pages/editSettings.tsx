import React, {useState} from 'react';
import {withTransaction} from '@elastic/apm-rum-react';
import {FormProvider, useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {AlertInline, ButtonText, IconGovernance} from '@aragon/ui-components';
import {constants} from 'ethers';

import DefineMetadata from 'containers/defineMetadata';
import ConfigureCommunity from 'containers/configureCommunity';

const defaultValues = {
  links: [{label: '', href: ''}],
  wallets: [{address: constants.AddressZero, amount: '0'}],
  membership: 'token',
  whitelistWallets: [],
};

const EditSettings: React.FC = () => {
  const [currentMenu, setCurrentMenu] = useState<'metadata' | 'governance'>(
    'metadata'
  );
  const {t} = useTranslation();
  const formMethods = useForm({
    mode: 'onChange',
    defaultValues,
  });

  return (
    <FormProvider {...formMethods}>
      <div className="col-span-full desktop:col-start-2 desktop:col-end-12 mt-5 space-y-8">
        <div className="p-5 space-y-2 bg-white rounded-xl">
          <h1 className="text-3xl font-bold text-ui-800">
            {t('settings.editDaoSettings')}
          </h1>
          <p className="text-lg text-ui-600">{t('settings.editSubtitle')}</p>
        </div>

        <div>
          <div className="flex justify-between items-center p-3 bg-white rounded-xl">
            <p className="text-lg text-ui-800">
              {t('labels.review.daoMetadata')}
            </p>
            <ButtonText
              label={
                currentMenu === 'metadata'
                  ? t('settings.resetChanges')
                  : t('settings.edit')
              }
              mode={currentMenu === 'metadata' ? 'secondary' : 'primary'}
              onClick={() => setCurrentMenu('metadata')}
              bgWhite
            />
          </div>
          {currentMenu === 'metadata' && (
            <div className="mx-auto mt-5 desktop:mt-8 space-y-3 desktop:w-3/5">
              <DefineMetadata />
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center p-3 bg-white rounded-xl">
            <p className="text-lg text-ui-800">
              {t('labels.review.governance')}
            </p>
            <ButtonText
              label={
                currentMenu === 'governance'
                  ? t('settings.resetChanges')
                  : t('settings.edit')
              }
              mode={currentMenu === 'governance' ? 'secondary' : 'primary'}
              onClick={() => setCurrentMenu('governance')}
              bgWhite
            />
          </div>
          {currentMenu === 'governance' && (
            <div className="mx-auto mt-5 desktop:mt-8 space-y-3 desktop:w-3/5">
              <ConfigureCommunity />
            </div>
          )}
        </div>

        <div className="mx-auto mt-5 desktop:mt-8 space-y-2 desktop:w-3/5">
          <div className="flex space-x-3">
            <ButtonText
              label={t('settings.newSettings')}
              iconLeft={<IconGovernance />}
            />
            <ButtonText label={t('settings.resetChanges')} mode="secondary" />
          </div>

          <AlertInline
            label={t('settings.proposeSettingsInfo')}
            mode="neutral"
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default withTransaction('EditSettings', 'component')(EditSettings);
