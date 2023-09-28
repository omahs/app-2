import {
  Breadcrumb,
  ButtonText,
  IconChevronLeft,
  IconChevronRight,
  Wizard,
} from '@aragon/ods';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import ExitProcessMenu, {ProcessType} from 'containers/exitProcessMenu';
import {useStepper} from 'hooks/useStepper';
import {StepProps} from './step';

export type FullScreenStepperProps = {
  navLabel: string;
  returnPath: string;
  processType?: ProcessType; // if no process type, don't use warning
  wizardProcessName: string;
  children: React.FunctionComponentElement<StepProps>[];
};

type FullScreenStepperContextType = {
  currentStep: number;
  setStep: (newStep: number) => void;
  prev: () => void;
  next: () => void;
};

const FullScreenStepperContext = createContext<
  FullScreenStepperContextType | undefined
>(undefined);

export const useFormStep = () =>
  useContext(FullScreenStepperContext) as FullScreenStepperContextType;

export const FullScreenStepper: React.FC<FullScreenStepperProps> = ({
  wizardProcessName,
  processType,
  children,
  navLabel,
  returnPath,
}) => {
  const skipSteps = children.filter(child => child.props.skipStep !== true);

  const {t} = useTranslation();
  const navigate = useNavigate();

  const [showExitProcessMenu, setShowExitProcessMenu] = useState(false);
  const {currentStep, prev, next, setStep} = useStepper(skipSteps.length);

  const currentIndex = currentStep - 1;
  const {
    includeStepper = true,
    wizardTitle,
    wizardDescription,
    hideWizard,
    fullWidth,
    customHeader,
    customFooter,
    backButtonLabel,
    nextButtonLabel,
    isNextButtonDisabled,
    onBackButtonClicked,
    onNextButtonClicked,
    onNextButtonDisabledClicked,
  } = skipSteps[currentIndex].props;

  const totalSteps = useMemo(() => {
    let total = 0;
    skipSteps.forEach((_, index) => {
      if (!skipSteps[index].props.hideWizard) total++;
    });
    return total;
  }, [skipSteps]);

  const previousHideWizards = useMemo(() => {
    let total = 0;
    for (let i = 0; i < currentStep; i++) {
      skipSteps[i].props.hideWizard && total++;
    }
    return total;
  }, [skipSteps, currentStep]);

  const value = {currentStep, setStep, prev, next};

  const currentFormStep = useMemo(() => {
    if (hideWizard) {
      return currentStep;
    } else {
      return currentStep - previousHideWizards;
    }
  }, [currentStep, hideWizard, previousHideWizards]);

  /*************************************************
   *                    Effects                    *
   *************************************************/
  // Scroll Top each time the CurrentStep changed
  useEffect(() => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, [currentStep]);

  /*************************************************
   *              Callbacks & Handlers             *
   *************************************************/
  const handleExitButtonClicked = useCallback(() => {
    if (processType) {
      setShowExitProcessMenu(true);
    } else {
      navigate(returnPath);
    }
  }, [processType, navigate, returnPath]);

  const exitProcess = useCallback(() => {
    setShowExitProcessMenu(false);
    navigate(returnPath);
  }, [navigate, returnPath]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  return (
    <FullScreenStepperContext.Provider value={value}>
      <Layout>
        <div className="-mx-2 tablet:mx-0 tablet:mt-3">
          {!hideWizard && (
            <Wizard
              includeStepper={includeStepper}
              processName={wizardProcessName}
              title={wizardTitle || ''}
              description={wizardDescription || ''}
              totalSteps={totalSteps}
              currentStep={currentFormStep}
              renderHtml
              nav={
                <Breadcrumb
                  crumbs={{
                    label: navLabel,
                    path: returnPath,
                  }}
                  onClick={handleExitButtonClicked}
                />
              }
            />
          )}
          {customHeader &&
            React.cloneElement(customHeader, {
              onExitButtonClick: handleExitButtonClicked,
            })}
        </div>
        <FormLayout fullWidth={fullWidth || false}>
          {skipSteps[currentIndex]}
          {customFooter ? (
            <>{customFooter}</>
          ) : (
            <FormFooter>
              <ButtonText
                mode="secondary"
                size="large"
                label={backButtonLabel || t('labels.back')}
                onClick={() =>
                  onBackButtonClicked ? onBackButtonClicked() : prev()
                }
                disabled={currentStep === 1}
                iconLeft={<IconChevronLeft />}
              />
              <ButtonValidationTrigger onClick={onNextButtonDisabledClicked}>
                <ButtonText
                  label={nextButtonLabel || t('labels.next')}
                  size="large"
                  onClick={() =>
                    onNextButtonClicked ? onNextButtonClicked(next) : next()
                  }
                  disabled={isNextButtonDisabled}
                  iconRight={<IconChevronRight />}
                />
              </ButtonValidationTrigger>
            </FormFooter>
          )}
        </FormLayout>
      </Layout>
      {processType && (
        <ExitProcessMenu
          isOpen={showExitProcessMenu}
          onClose={() => setShowExitProcessMenu(false)}
          ctaCallback={exitProcess}
          processType={processType}
        />
      )}
    </FullScreenStepperContext.Provider>
  );
};

const Layout = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-2 desktop:col-end-12 font-medium text-ui-600',
})``;

type FormLayoutProps = {
  fullWidth: boolean;
};

const FormLayout = styled.div.attrs<{fullWidth: FormLayoutProps}>(
  ({fullWidth}) => ({
    className: `mt-5 desktop:mt-8 mx-auto space-y-5 ${
      !fullWidth && 'desktop:w-3/5'
    }`,
  })
)<FormLayoutProps>``;

const FormFooter = styled.div.attrs({
  className: 'flex justify-between desktop:pt-3',
})``;

const ButtonValidationTrigger = styled.div``;
