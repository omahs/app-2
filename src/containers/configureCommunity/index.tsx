import {
  AlertInline,
  CheckboxListItem,
  Label,
  LinearProgress,
  NumberInput,
  Tag,
} from '@aragon/ods';
import {MultisigMinimumApproval} from 'components/multisigMinimumApproval';
import React, {useCallback} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {MinParticipation} from './minParticipation';

import {
  MAX_DURATION_DAYS,
  HOURS_IN_DAY,
  MINS_IN_DAY,
  MINS_IN_HOUR,
  MIN_DURATION_HOURS,
} from 'utils/constants';
import {getDaysHoursMins} from 'utils/date';

export type ConfigureCommunityProps = {
  isSettingPage?: boolean;
};

const ConfigureCommunity: React.FC<ConfigureCommunityProps> = ({
  isSettingPage = false,
}) => {
  const {t} = useTranslation();
  const {control, setValue, getValues, trigger} = useFormContext();

  const [
    membership,
    earlyExecution,
    durationDays,
    durationHours,
    durationMinutes,
  ] = useWatch({
    name: [
      'membership',
      'earlyExecution',
      'durationDays',
      'durationHours',
      'durationMinutes',
    ],
  });

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleDaysChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);
      if (value >= MAX_DURATION_DAYS) {
        e.target.value = MAX_DURATION_DAYS.toString();

        setValue('durationDays', MAX_DURATION_DAYS.toString());
        setValue('durationHours', '0');
        setValue('durationMinutes', '0');
      } else if (value === 0 && durationHours === '0') {
        setValue('durationHours', MIN_DURATION_HOURS.toString());
      }
      trigger(['durationMinutes', 'durationHours', 'durationDays']);
      onChange(e);
    },
    [durationHours, setValue, trigger]
  );

  const handleHoursChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);
      if (value >= HOURS_IN_DAY) {
        const {days, hours} = getDaysHoursMins(value, 'hours');
        e.target.value = hours.toString();

        if (days > 0) {
          setValue(
            'durationDays',
            (Number(getValues('durationDays')) + days).toString()
          );
        }
      } else if (value === 0 && durationDays === '0') {
        setValue('durationHours', MIN_DURATION_HOURS.toString());
        setValue('durationMinutes', '0');
        e.target.value = MIN_DURATION_HOURS.toString();
      }
      trigger(['durationMinutes', 'durationHours', 'durationDays']);
      onChange(e);
    },
    [durationDays, getValues, setValue, trigger]
  );

  const handleMinutesChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);

      if (value >= MINS_IN_HOUR) {
        const [oldDays, oldHours] = getValues([
          'durationDays',
          'durationHours',
        ]);

        const totalMins =
          oldDays * MINS_IN_DAY + oldHours * MINS_IN_HOUR + value;

        const {days, hours, mins} = getDaysHoursMins(totalMins);
        setValue('durationDays', days.toString());
        setValue('durationHours', hours.toString());
        e.target.value = mins.toString();
      }
      trigger(['durationMinutes', 'durationHours', 'durationDays']);
      onChange(e);
    },
    [getValues, setValue, trigger]
  );

  const handleEarlyExecutionChanged = useCallback(
    (value: boolean, onChange: (value: boolean) => void) => {
      if (value && getValues('voteReplacement')) {
        setValue('voteReplacement', false);
      }

      onChange(value);
    },
    [getValues, setValue]
  );

  const percentageInputValidator = (value: string | number) => {
    return Number(value) <= 100 && Number(value) >= 0
      ? true
      : t('errors.percentage');
  };

  /*************************************************
   *                   Render                     *
   *************************************************/
  return (
    <>
      {membership === 'multisig' && (
        <FormItem>
          <MultisigMinimumApproval {...{isSettingPage}} />
        </FormItem>
      )}
      {membership === 'token' && (
        <>
          {/* Support Threshold */}
          <FormItem>
            <Label
              label={t('labels.supportThreshold')}
              helpText={t('createDAO.step4.supportThresholdSubtitle')}
            />

            <Controller
              name="minimumApproval"
              control={control}
              defaultValue="50"
              rules={{
                validate: value => percentageInputValidator(value),
              }}
              render={({
                field: {onBlur, onChange, value, name},
                fieldState: {error},
              }) => (
                <>
                  <ApprovalContainer>
                    <div className="tablet:w-1/3">
                      <NumberInput
                        name={name}
                        value={value}
                        onBlur={onBlur}
                        onChange={onChange}
                        placeholder={t('placeHolders.daoName')}
                        view="percentage"
                      />
                    </div>

                    <div className="flex flex-1 items-center">
                      <Tag
                        label={t('labels.yes')}
                        colorScheme="primary"
                        className="mr-1.5 w-6 justify-center"
                      />

                      <LinearProgressContainer>
                        <LinearProgress max={100} value={value} />
                        <ProgressBarTick />
                        <ProgressInfo1>
                          <p
                            className="text-right font-bold text-primary-500"
                            style={{flexBasis: `${value}%`}}
                          >
                            {value !== '100' ? '>' : ''}
                            {value}%
                          </p>
                        </ProgressInfo1>
                      </LinearProgressContainer>

                      <Tag
                        label={t('labels.no')}
                        className="ml-1.5 w-6 justify-center"
                      />
                    </div>
                  </ApprovalContainer>

                  {error?.message && (
                    <AlertInline label={error.message} mode="critical" />
                  )}
                  {value < 50 ? (
                    <AlertInline
                      label={t('createDAO.step4.alerts.minority')}
                      mode="warning"
                    />
                  ) : (
                    <AlertInline
                      label={t('createDAO.step4.alerts.majority')}
                      mode="success"
                    />
                  )}
                </>
              )}
            />
          </FormItem>

          {/* Minimum Participation */}
          <FormItem>
            <MinParticipation />
          </FormItem>

          {/* Min Duration */}
          <FormItem>
            <Label
              label={t('labels.minimumDuration')}
              helpText={t('createDAO.step4.durationSubtitle')}
            />
            <DurationContainer>
              <Controller
                name="durationMinutes"
                control={control}
                defaultValue="0"
                rules={{
                  required: t('errors.emptyDistributionMinutes'),
                  validate: value =>
                    value <= 59 && value >= 0
                      ? true
                      : t('errors.distributionMinutes'),
                }}
                render={({
                  field: {onBlur, onChange, value, name},
                  fieldState: {error},
                }) => (
                  <TimeLabelWrapper>
                    <TimeLabel>{t('createDAO.step4.minutes')}</TimeLabel>
                    <NumberInput
                      name={name}
                      value={value}
                      onBlur={onBlur}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleMinutesChanged(e, onChange)
                      }
                      placeholder={'0'}
                      min="0"
                      disabled={durationDays === MAX_DURATION_DAYS.toString()}
                    />
                    {error?.message && (
                      <AlertInline label={error.message} mode="critical" />
                    )}
                  </TimeLabelWrapper>
                )}
              />

              <Controller
                name="durationHours"
                control={control}
                defaultValue="0"
                rules={{required: t('errors.emptyDistributionHours')}}
                render={({
                  field: {onBlur, onChange, value, name},
                  fieldState: {error},
                }) => (
                  <TimeLabelWrapper>
                    <TimeLabel>{t('createDAO.step4.hours')}</TimeLabel>
                    <NumberInput
                      name={name}
                      value={value}
                      onBlur={onBlur}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleHoursChanged(e, onChange)
                      }
                      placeholder={'0'}
                      min="0"
                      disabled={durationDays === MAX_DURATION_DAYS.toString()}
                    />
                    {error?.message && (
                      <AlertInline label={error.message} mode="critical" />
                    )}
                  </TimeLabelWrapper>
                )}
              />

              <Controller
                name="durationDays"
                control={control}
                defaultValue="1"
                rules={{
                  required: t('errors.emptyDistributionDays'),
                  validate: value =>
                    value >= 0 ? true : t('errors.distributionDays'),
                }}
                render={({
                  field: {onBlur, onChange, value, name},
                  fieldState: {error},
                }) => (
                  <TimeLabelWrapper>
                    <TimeLabel>{t('createDAO.step4.days')}</TimeLabel>
                    <NumberInput
                      name={name}
                      value={value}
                      onBlur={onBlur}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleDaysChanged(e, onChange)
                      }
                      placeholder={'0'}
                      min="0"
                    />
                    {error?.message && (
                      <AlertInline label={error.message} mode="critical" />
                    )}
                  </TimeLabelWrapper>
                )}
              />
            </DurationContainer>
            {durationDays === MAX_DURATION_DAYS.toString() ? (
              <AlertInline
                label={t('alert.maxDurationAlert') as string}
                mode="warning"
              />
            ) : durationDays === '0' &&
              durationHours === MIN_DURATION_HOURS.toString() &&
              durationMinutes === '0' ? (
              <AlertInline
                label={t('alert.minDurationAlert') as string}
                mode="warning"
              />
            ) : (
              <AlertInline
                label={t('alert.durationAlert') as string}
                mode="neutral"
              />
            )}
          </FormItem>
          {/* Early execution */}
          <FormItem>
            <Label
              label={t('labels.earlyExecution')}
              helpText={t('labels.earlyExecutionDescription')}
            />
            <Controller
              name="earlyExecution"
              control={control}
              render={({field: {onChange, value}}) => (
                <ToggleCheckList
                  onChange={changeValue =>
                    handleEarlyExecutionChanged(changeValue, onChange)
                  }
                  value={value as boolean}
                />
              )}
            />
          </FormItem>
          {/* Vote replacement */}
          <FormItem>
            <Label
              label={t('labels.voteReplacement')}
              helpText={t('labels.voteReplacementDescription')}
            />
            <Controller
              name="voteReplacement"
              control={control}
              render={({field: {onChange, value}}) => (
                <ToggleCheckList
                  onChange={onChange}
                  value={value as boolean}
                  disabled={earlyExecution}
                />
              )}
            />
          </FormItem>
        </>
      )}
    </>
  );
};

export default ConfigureCommunity;

const ToggleCheckList = ({
  disabled,
  onChange,
  value,
}: {
  disabled?: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
}) => {
  const {t} = useTranslation();

  return (
    <ToggleCheckListContainer>
      <ToggleCheckListItemWrapper>
        <CheckboxListItem
          label={t('labels.no')}
          multiSelect={false}
          disabled={disabled}
          onClick={() => onChange(false)}
          type={value ? 'default' : 'active'}
        />
      </ToggleCheckListItemWrapper>

      <ToggleCheckListItemWrapper>
        <CheckboxListItem
          label={t('labels.yes')}
          multiSelect={false}
          disabled={disabled}
          onClick={() => onChange(true)}
          type={value ? 'active' : 'default'}
        />
      </ToggleCheckListItemWrapper>
    </ToggleCheckListContainer>
  );
};

const ToggleCheckListContainer = styled.div.attrs({
  className: 'flex gap-x-3',
})``;

const ToggleCheckListItemWrapper = styled.div.attrs({className: 'flex-1'})``;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const DurationContainer = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row space-y-1.5 tablet:space-y-0 tablet:space-x-1.5 p-3 bg-ui-0 rounded-xl',
})``;

const TimeLabelWrapper = styled.div.attrs({
  className: 'w-full tablet:w-1/2 space-y-0.5',
})``;

const TimeLabel = styled.span.attrs({
  className: 'text-sm font-bold text-ui-800',
})``;

const ApprovalContainer = styled.div.attrs({
  className:
    'flex flex-col flex-col-reverse tablet:flex-row tablet:items-center p-3 pt-4 tablet:p-3 space-y-3 space-y-reverse tablet:space-y-0 tablet:space-x-3 rounded-xl bg-ui-0',
})``;

const LinearProgressContainer = styled.div.attrs({
  className: 'flex relative flex-1 items-center',
})``;

const ProgressBarTick = styled.div.attrs({
  className:
    'absolute left-1/2 w-1 h-2.5 border-r-2 border-l-2 -translate-x-1/2 bg-ui-300 border-ui-0',
})``;

const ProgressInfo1 = styled.div.attrs({
  className:
    'flex absolute -top-2.5 justify-between space-x-0.5 w-full text-sm',
})``;
