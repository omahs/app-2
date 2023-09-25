import {
  AlertInline,
  ButtonWallet,
  Label,
  TextareaSimple,
  TextareaWYSIWYG,
  TextInput,
} from '@aragon/ods';
import React, {MouseEventHandler} from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import AddLinks from 'components/addLinks';
import {useWallet} from 'hooks/useWallet';
import {StringIndexed} from 'utils/types';
import {Controller, useFormContext} from 'react-hook-form';
import {isOnlyWhitespace} from 'utils/library';
import {UpdateListItem} from 'containers/updateListItem/updateListItem';
import {useParams} from 'react-router-dom';
const DefineProposal: React.FC = () => {
  const {t} = useTranslation();
  const {address, ensAvatarUrl} = useWallet();
  const {control} = useFormContext();
  const {type} = useParams();

  const UpdateItems = [
    {
      id: 'os',
      label: 'Aragon OSx v1.3.0',
      helptext: 'TBD inline release notes',
      LinkLabel: 'TBD inline release notes',
      tagLabelNatural: 'Latest',
      onClickActionSecondary: (e: React.MouseEvent) => e?.stopPropagation(),
    },
    {
      id: 'plugin',
      label: 'Token voting v1.12',
      helptext: 'TBD inline release notes',
      LinkLabel: 'TBD inline release notes',
      tagLabelNatural: 'Latest',
      tagLabelInfo: 'Prepared',
      onClickActionPrimary: (e: React.MouseEvent) => e?.stopPropagation(),
      onClickActionSecondary: (e: React.MouseEvent) => e?.stopPropagation(),
    },
  ];

  if (type === 'os-update') {
    return (
      <UpdateGroupWrapper>
        <Controller
          name="osUpdate"
          rules={{required: 'Validate'}}
          control={control}
          render={({field: {onChange, value}}) => (
            <>
              {UpdateItems.map((data, index) => (
                <UpdateListItem
                  key={index}
                  {...data}
                  type={value?.[data.id] ? 'active' : 'default'}
                  onClick={() =>
                    onChange({
                      ...value,
                      [data.id]: !value?.[data.id],
                    })
                  }
                />
              ))}
            </>
          )}
        />
      </UpdateGroupWrapper>
    );
  }

  return (
    <>
      <FormItem>
        <Label label={t('labels.author')} />
        <ButtonWallet
          label="You"
          src={ensAvatarUrl || address}
          isConnected
          disabled
        />
      </FormItem>

      <FormItem>
        <Label label={t('newWithdraw.defineProposal.title')} />
        <Controller
          name="proposalTitle"
          defaultValue=""
          control={control}
          rules={{
            required: t('errors.required.title'),
            validate: value =>
              isOnlyWhitespace(value) ? t('errors.required.title') : true,
          }}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <>
              <TextInput
                name={name}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                placeholder={t('newWithdraw.defineProposal.titlePlaceholder')}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      <FormItem>
        <Label label={t('labels.summary')} />
        <Controller
          name="proposalSummary"
          control={control}
          rules={{
            required: t('errors.required.summary'),
            validate: value =>
              isOnlyWhitespace(value) ? t('errors.required.summary') : true,
          }}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <>
              <TextareaSimple
                name={name}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                placeholder={t('newWithdraw.defineProposal.summaryPlaceholder')}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      <FormItem>
        <Label label={t('newWithdraw.defineProposal.body')} isOptional={true} />
        <Controller
          name="proposal"
          control={control}
          render={({field: {name, onBlur, onChange, value}}) => (
            <TextareaWYSIWYG
              name={name}
              value={value}
              onBlur={onBlur}
              onChange={onChange}
              placeholder={t('newWithdraw.defineProposal.proposalPlaceholder')}
            />
          )}
        />
      </FormItem>

      <FormItem>
        <Label
          label={t('labels.resources')}
          helpText={t('labels.resourcesHelptext')}
          isOptional
        />
        <AddLinks buttonPlusIcon buttonLabel={t('labels.addResource')} />
      </FormItem>
    </>
  );
};

export default DefineProposal;

/**
 * Check if the screen is valid
 * @param dirtyFields - The fields that have been changed
 * @param errors List of fields with errors
 * @returns Whether the screen is valid
 */
export function isValid(dirtyFields: StringIndexed, errors: StringIndexed) {
  // required fields not dirty
  if (
    !dirtyFields.proposalTitle ||
    !dirtyFields.proposalSummary ||
    errors.proposalTitle ||
    errors.proposalSummary
  )
    return false;
  return true;
}

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const UpdateGroupWrapper = styled.div.attrs({
  className: 'flex tablet:flex-row flex-col gap-y-1.5 gap-x-3',
})``;
