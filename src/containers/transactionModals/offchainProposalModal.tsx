import React, {useMemo} from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import {CHAIN_METADATA} from 'utils/constants';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useNetwork} from 'context/network';
import {formatUnits} from 'utils/library';
import {
  OffchainProposalSteps,
  StepStatus,
} from '../../context/createOffchainProposal';
import OffchainProposalProgress from '../../components/OffchainProposalProgress';
import {
  AlertInline,
  ButtonText,
  IconChevronRight,
  IconReload,
} from '@aragon/ods';

type OffchainProposalModalProps = {
  // state: TransactionState;
  steps: OffchainProposalSteps;
  globalState: StepStatus;
  callback: () => void;
  isOpen: boolean;
  onClose: () => void;
  closeOnDrag: boolean;
  maxFee: BigInt | undefined;
  averageFee: BigInt | undefined;
  gasEstimationError?: Error;
  tokenPrice: number;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonLabelSuccess?: string;
  disabledCallback?: boolean;
};

const OffchainProposalModal: React.FC<OffchainProposalModalProps> = ({
  steps,
  globalState,
  callback,
  isOpen,
  onClose,
  closeOnDrag,
  maxFee,
  averageFee,
  gasEstimationError,
  tokenPrice,
  title,
  subtitle,
  buttonLabel,
  buttonLabelSuccess,
  disabledCallback,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const btnLabel = {
    [StepStatus.WAITING]: t('offChainProposalCreation.publishProposal'),
    [StepStatus.LOADING]: undefined,
    [StepStatus.SUCCESS]: t('offChainProposalCreation.gotoProposal'),
    [StepStatus.ERROR]: t('offChainProposalCreation.tryAgain'),
  };

  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  // TODO: temporarily returning error when unable to estimate fees
  // for chain on which contract not deployed
  const [totalCost, formattedAverage] = useMemo(
    () =>
      averageFee === undefined
        ? ['Error calculating costs', 'Error estimating fees']
        : [
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(
              Number(
                formatUnits(averageFee.toString(), nativeCurrency.decimals)
              ) * tokenPrice
            ),
            `${formatUnits(averageFee.toString(), nativeCurrency.decimals)}`,
          ],
    [averageFee, nativeCurrency.decimals, tokenPrice]
  );

  const formattedMax =
    maxFee === undefined
      ? undefined
      : `${formatUnits(maxFee.toString(), nativeCurrency.decimals)}`;

  if (!steps) {
    return null;
  }

  return (
    <ModalBottomSheetSwitcher
      {...{isOpen, onClose, closeOnDrag}}
      title={title || t('createDAO.review.title')}
      subtitle={subtitle}
    >
      {globalState === StepStatus.WAITING && (
        <GasCostTableContainer>
          <GasCostEthContainer>
            <NoShrinkVStack>
              <Label>{t('TransactionModal.estimatedFees')}</Label>
              <p className="text-sm text-ui-500">
                {t('TransactionModal.maxFee')}
              </p>
            </NoShrinkVStack>
            <VStack>
              <StrongText>
                <div className="truncate">{formattedAverage}</div>
                <div>{`${nativeCurrency.symbol}`}</div>
              </StrongText>
              <div className="flex justify-end space-x-0.5 text-sm text-right text-ui-500">
                <div className="truncate">{formattedMax}</div>
                <div>{`${nativeCurrency.symbol}`}</div>
              </div>
            </VStack>
          </GasCostEthContainer>

          <GasTotalCostEthContainer>
            <NoShrinkVStack>
              <Label>{t('TransactionModal.totalCost')}</Label>
            </NoShrinkVStack>
            <VStack>
              <StrongText>
                <div className="truncate">{formattedAverage}</div>
                <div>{`${nativeCurrency.symbol}`}</div>
              </StrongText>
              <p className="text-sm text-right text-ui-500">{totalCost}</p>
            </VStack>
          </GasTotalCostEthContainer>
        </GasCostTableContainer>
      )}
      {globalState !== StepStatus.WAITING && (
        <StepsContainer>
          <OffchainProposalProgress steps={steps} />
          {globalState === StepStatus.LOADING && (
            <AlertInline
              label={t('offChainProposalCreation.processWarning')}
              mode="critical"
            />
          )}
        </StepsContainer>
      )}
      {gasEstimationError && (
        <AlertInlineContainer>
          <AlertInline
            label={t('TransactionModal.gasEstimationErrorLabel') as string}
            mode="warning"
          />
        </AlertInlineContainer>
      )}
      {btnLabel[globalState] !== undefined && (
        <ButtonContainer>
          <ButtonText
            className="mt-3 w-full"
            label={btnLabel[globalState]!}
            iconLeft={
              globalState === StepStatus.ERROR ? <IconReload /> : undefined
            }
            iconRight={
              globalState === StepStatus.WAITING ||
              globalState === StepStatus.SUCCESS ? (
                <IconChevronRight />
              ) : undefined
            }
            disabled={gasEstimationError !== undefined}
            onClick={callback}
          />
        </ButtonContainer>
      )}
    </ModalBottomSheetSwitcher>
  );
};

export default OffchainProposalModal;

const StepGlobalMessage = styled.div.attrs(({color}: {color?: string}) => ({
  className: `flex space-x-2 items-center  ${color}`,
}))``;

const ButtonContainer = styled.div.attrs({
  className: 'px-3 pb-3 rounded-b-xl',
})``;

const GasCostTableContainer = styled.div.attrs({
  className: 'm-3 bg-white rounded-xl border border-ui-100 divide-y',
})``;

const GasCostEthContainer = styled.div.attrs({
  className: 'flex justify-between py-1.5 px-2 space-x-4',
})``;

const GasTotalCostEthContainer = styled.div.attrs({
  className: 'flex justify-between py-1.5 px-2 rounded-b-xl bg-ui-100',
})``;

const AlertInlineContainer = styled.div.attrs({
  className: 'mx-auto mt-2 w-max',
})``;

const StepsContainer = styled.div.attrs({
  className:
    'px-3 py-3 rounded-b-xl bg-white mx-3 my-3 border-ui-100 rounded-xl flex flex-col gap-3',
})``;

const NoShrinkVStack = styled.div.attrs({
  className: 'space-y-0.25 flex-shrink-0',
})``;

const VStack = styled.div.attrs({
  className: 'space-y-0.25 overflow-hidden',
})``;

const StrongText = styled.p.attrs({
  className: 'font-bold text-right text-ui-600 flex space-x-0.5',
})``;

const Label = styled.p.attrs({
  className: 'text-ui-600',
})``;
