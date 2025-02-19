import {
  Breadcrumb,
  ButtonText,
  IconAdd,
  IlluObject,
  IllustrationHuman,
  Tag,
} from '@aragon/ods';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {StateEmpty} from 'components/stateEmpty';
import {Loading} from 'components/temporary';
import TokenList from 'components/tokenList';
import TransferList from 'components/transferList';
import {
  PageWrapper,
  TokenSectionWrapper,
  TransferSectionWrapper,
} from 'components/wrappers';
import PageEmptyState from 'containers/pageEmptyState';
import {useGlobalModalContext} from 'context/globalModals';
import {useTransactionDetailContext} from 'context/transactionDetail';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoVault} from 'hooks/useDaoVault';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import useScreen from 'hooks/useScreen';
import {trackEvent} from 'services/analytics';
import {htmlIn} from 'utils/htmlIn';
import {sortTokens} from 'utils/tokens';

type Sign = -1 | 0 | 1;
const colors: Record<Sign, string> = {
  '-1': 'text-critical-800',
  '1': 'text-success-600',
  '0': 'text-ui-600',
};

export const Finance: React.FC = () => {
  const {t} = useTranslation();
  const {data: daoDetails, isLoading} = useDaoDetailsQuery();
  const {open} = useGlobalModalContext();
  const {isMobile, isDesktop} = useScreen();

  // load dao details
  const navigate = useNavigate();
  const {breadcrumbs, icon, tag} = useMappedBreadcrumbs();

  const {handleTransferClicked} = useTransactionDetailContext();
  const {
    tokens,
    totalAssetChange,
    totalAssetValue,
    transfers,
    isDaoBalancePositive,
  } = useDaoVault();

  sortTokens(tokens, 'treasurySharePercentage', true);

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (isLoading) {
    return <Loading />;
  }

  if (isDesktop) {
    // full page empty state
    if (tokens.length === 0 && transfers.length === 0) {
      return (
        <PageEmptyState
          title={t('finance.emptyState.title')}
          subtitle={htmlIn(t)('finance.emptyState.description')}
          Illustration={
            <div className="flex">
              <IllustrationHuman
                {...{
                  body: 'chart',
                  expression: 'excited',
                  hair: 'bun',
                }}
                {...(isMobile
                  ? {height: 165, width: 295}
                  : {height: 225, width: 400})}
              />
              <IlluObject object={'wallet'} className="-ml-36" />
            </div>
          }
          primaryButton={{
            label: t('finance.emptyState.buttonLabel'),
            onClick: () => open('deposit'),
          }}
        />
      );
    }

    // tokens only empty state
    if (tokens.length === 0 && !isDaoBalancePositive) {
      return (
        <PageWrapper includeHeader={false}>
          <div className="mb-8 mt-5">
            <StateEmpty
              type="Human"
              mode="card"
              body="blocks"
              expression="surprised"
              sunglass="small_intellectual"
              hair="long"
              accessory="flushed"
              title={t('finance.treasuryEmptyState.title')}
              description={htmlIn(t)('finance.treasuryEmptyState.desc')}
              renderHtml
              primaryButton={{
                label: t('finance.emptyState.buttonLabel'),
                onClick: () => {
                  open('deposit');
                },
              }}
            />
          </div>
          <TransferSectionWrapper
            title={t('finance.transferSection')}
            showButton
          >
            <ListContainer>
              <TransferList
                transfers={transfers.slice(0, 5)}
                onTransferClick={handleTransferClicked}
              />
            </ListContainer>
          </TransferSectionWrapper>
        </PageWrapper>
      );
    }
  }

  if (isMobile) {
    // full page empty state
    if (tokens.length === 0 && transfers.length === 0) {
      return (
        <PageWrapper
          customHeader={
            <HeaderContainer>
              <Header>
                <Breadcrumb
                  icon={icon}
                  crumbs={breadcrumbs}
                  tag={tag}
                  onClick={navigate}
                />
                <ContentContainer>
                  <TextContainer>
                    <Title>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(totalAssetValue)}
                    </Title>

                    <SubtitleContainer>
                      <Tag label="24h" />
                      <Description
                        className={colors[Math.sign(totalAssetChange) as Sign]}
                      >
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          signDisplay: 'always',
                        }).format(totalAssetChange)}
                      </Description>
                    </SubtitleContainer>
                  </TextContainer>

                  {/* Button */}
                  <ButtonText
                    size="large"
                    label={t('TransferModal.newTransfer')}
                    iconLeft={<IconAdd />}
                    className="w-full tablet:w-auto"
                    onClick={() => {
                      trackEvent('finance_newTransferBtn_clicked', {
                        dao_address: daoDetails?.address,
                      });
                      open('transfer');
                    }}
                  />
                </ContentContainer>
              </Header>
            </HeaderContainer>
          }
        >
          <PageEmptyState
            title={t('finance.emptyState.title')}
            subtitle={htmlIn(t)('finance.emptyState.description')}
            Illustration={
              <div className="flex">
                <IllustrationHuman
                  {...{
                    body: 'chart',
                    expression: 'excited',
                    hair: 'bun',
                  }}
                  {...(isMobile
                    ? {height: 165, width: 295}
                    : {height: 225, width: 400})}
                />
                <IlluObject object={'wallet'} className="-ml-32" />
              </div>
            }
            primaryButton={{
              label: t('finance.emptyState.buttonLabel'),
              onClick: () => open('deposit'),
            }}
          />
        </PageWrapper>
      );
    }

    // tokens only empty state
    if (tokens.length === 0 && !isDaoBalancePositive) {
      return (
        <PageWrapper
          customHeader={
            <HeaderContainer>
              <Header>
                <Breadcrumb
                  icon={icon}
                  crumbs={breadcrumbs}
                  tag={tag}
                  onClick={navigate}
                />
                <StateEmpty
                  type="Human"
                  mode="inline"
                  body="blocks"
                  expression="surprised"
                  sunglass="small_intellectual"
                  hair="long"
                  accessory="flushed"
                  title={t('finance.treasuryEmptyState.title')}
                  description={htmlIn(t)('finance.treasuryEmptyState.desc')}
                  renderHtml
                  primaryButton={{
                    label: t('finance.emptyState.buttonLabel'),
                    onClick: () => {
                      open('deposit');
                    },
                  }}
                />
              </Header>
            </HeaderContainer>
          }
        >
          <div className="mt-1">
            <TransferSectionWrapper
              title={t('finance.transferSection')}
              showButton
            >
              <ListContainer>
                <TransferList
                  transfers={transfers.slice(0, 5)}
                  onTransferClick={handleTransferClicked}
                />
              </ListContainer>
            </TransferSectionWrapper>
          </div>
        </PageWrapper>
      );
    }
  }

  // tokens and transfers are available
  return (
    <PageWrapper
      customHeader={
        <HeaderContainer>
          <Header>
            {!isDesktop && (
              <Breadcrumb
                icon={icon}
                crumbs={breadcrumbs}
                tag={tag}
                onClick={navigate}
              />
            )}
            <ContentContainer>
              <TextContainer>
                <Title>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(totalAssetValue)}
                </Title>

                <SubtitleContainer>
                  <Tag label="24h" />
                  <Description
                    className={colors[Math.sign(totalAssetChange) as Sign]}
                  >
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      signDisplay: 'always',
                    }).format(totalAssetChange)}
                  </Description>
                </SubtitleContainer>
              </TextContainer>

              {/* Button */}
              <ButtonText
                size="large"
                label={t('TransferModal.newTransfer')}
                iconLeft={<IconAdd />}
                className="w-full tablet:w-auto"
                onClick={() => {
                  trackEvent('finance_newTransferBtn_clicked', {
                    dao_address: daoDetails?.address,
                  });
                  open('transfer');
                }}
              />
            </ContentContainer>
          </Header>
        </HeaderContainer>
      }
    >
      {tokens.length !== 0 && (
        <div className={'mb-3 mt-1 tablet:mb-8 tablet:mt-5'}>
          <TokenSectionWrapper title={t('finance.tokenSection')}>
            <ListContainer>
              <TokenList tokens={tokens.slice(0, 5)} />
            </ListContainer>
          </TokenSectionWrapper>
        </div>
      )}
      <TransferSectionWrapper title={t('finance.transferSection')} showButton>
        <ListContainer>
          <TransferList
            transfers={transfers.slice(0, 5)}
            onTransferClick={handleTransferClicked}
          />
        </ListContainer>
      </TransferSectionWrapper>
    </PageWrapper>
  );
};

const ListContainer = styled.div.attrs({
  className: 'py-2 space-y-2',
})``;

const HeaderContainer = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-3 desktop:col-end-11 -mx-2 tablet:mx-0 tablet:mt-3',
})``;

const SubtitleContainer = styled.div.attrs({
  className: 'flex gap-x-1.5 items-center mt-1',
})``;

const Header = styled.div.attrs({
  className: `p-2 desktop:p-0 pb-3 desktop:mt-5 space-y-2 tablet:space-y-3
   bg-ui-0 desktop:bg-transparent tablet:rounded-xl tablet:border
   tablet:border-ui-100 desktop:border-none tablet:shadow-100 desktop:shadow-none`,
})``;

const ContentContainer = styled.div.attrs({
  className: `flex flex-col tablet:flex-row tablet:gap-x-6 gap-y-2
     tablet: gap - y - 3 tablet: items - start desktop: items - center`,
})``;

const TextContainer = styled.div.attrs({
  className: 'tablet:flex-1 space-y-1 capitalize',
})``;

const Title = styled.h1.attrs({
  className: 'font-bold text-ui-800 ft-text-3xl',
})``;

const Description = styled.p.attrs({
  className: 'ft-text-lg' as string,
})``;
