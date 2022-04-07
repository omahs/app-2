import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useForm, useFormContext } from 'react-hook-form';
import { BigNumberish, ethers } from 'ethers';
import { DAOFactory } from 'typechain';
import { Breadcrumb, ButtonText, IconChevronRight } from '@aragon/ui-components';

import Blockchain from './blockchain';
import DaoMetadata from './daoMetadata';
import Community from './community';
import Governance from './governance';
import goLive from 'public/goLive.svg';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from 'utils/paths';
import DAOFactoryABI from 'abis/DAOFactory.json';

import { useProviders } from 'context/providers';
import { useDao } from 'hooks/useCachedDao';
import { WalletField } from '../../components/addWallets/row';
import { ICreateDaoERC20Voting } from '@aragon/sdk-client'

export const GoLiveHeader: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="tablet:p-3 desktop:p-6 px-2 pt-2 desktop:pt-3 pb-3 bg-ui-0 tablet:rounded-xl">
      <div className="desktop:hidden">
        <Breadcrumb
          crumbs={{ label: t('createDAO.title'), path: Dashboard }}
          onClick={(path: string) => navigate(path)}
        />
      </div>
      <div className="flex justify-between">
        <div className="pt-3 w-full">
          <h1 className="text-3xl font-bold text-ui-800">
            {t('createDAO.review.title')}
          </h1>
          <p className="mt-2 text-lg text-ui-600">
            {t('createDAO.review.description')}
          </p>
        </div>
        <ImageContainer src={goLive} />
      </div>
    </div>
  );
};

const GoLive: React.FC = () => {
  return (
    <Container>
      <Blockchain />
      <DaoMetadata />
      <Community />
      <Governance />
    </Container>
  );
};

export const GoLiveFooter: React.FC = () => {
  const { watch } = useFormContext();
  const { reviewCheck } = watch();
  const { t } = useTranslation();
  const { create: createDao } = useDao()
  const { getValues } = useForm()
  /**
   *
   * Return seconds given a certain amount of
   * days, hours and minutes
   *
   * @param {number} days
   * @param {number} hours
   * @param {number} minutes
   * @return {*}  {number}
   */
  const getMinDuration = (days: number, hours: number, minutes: number): number => {
    return minutes * 60 + hours * 3600 + days * 86400
  }
  const handleGoLive = () => {
    const minutes = parseInt(getValues('minutes'))
    const hours = parseInt(getValues('hours'))
    const days = parseInt(getValues('days'))
    const wallets: WalletField[] = getValues('wallets')
    const createDaoForm: ICreateDaoERC20Voting = {
      daoConfig: {
        name: getValues('daoName'),
        metadata: ''
        // {
        //    lodoAddress: getValues('daoLogo')
        //    summaryAddress: // getValues('daoSummary')
        //    links: [
        //      {name: 'da link', url:'https://daaa.link'}
        //     ]
        // }
      },
      tokenConfig: {
        address: getValues('isCustomToken') ? getValues('tokenAddress') : ethers.constants.AddressZero,
        name: getValues('tokenName'),
        symbol: getValues('symbol')
      },
      mintConfig: wallets ? wallets.map((wallet) => {
        return { address: wallet.address, balance: BigInt(wallet.amount) }
      }):[],
      votingConfig: {
        minSupport: parseInt(getValues('support')),
        minParticipation: parseInt(getValues('minimumApproval')),
        minDuration: getMinDuration(days, hours, minutes)
      }
    }
    createDao(createDaoForm).then((id:string) => {
      console.log(`dao  created: ${id}`)
    })
  }
  // const zeroAddress = ethers.constants.AddressZero;
  // const daoDummyName = "Rakesh's Syndicate";
  // const daoDummyMetadata = '0x00000000000000000000000000';
  // const dummyVoteSettings: [BigNumberish, BigNumberish, BigNumberish] = [
  //   1, 2, 3,
  // ];
  // const { infura: provider } = useProviders();

  const IsButtonDisabled = () =>
    !Object.values(reviewCheck).every(v => v === true);

  return (
    <div className="flex justify-center pt-3">
      <ButtonText
        size="large"
        iconRight={<IconChevronRight />}
        label={t('createDAO.review.button')}
        onClick={handleGoLive}
        //   async () => {
        //   const contract = new ethers.Contract(
        //     '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
        //     DAOFactoryABI,
        //     provider
        //   ) as DAOFactory;

        //   console.log(
        //     'NewDAO Gas:',
        //     await contract.estimateGas.newDAO(
        //       {
        //         name: daoDummyName,
        //         metadata: daoDummyMetadata,
        //       },
        //       {
        //         addr: zeroAddress,
        //         name: 'TokenName',
        //         symbol: 'TokenSymbol',
        //       },
        //       {
        //         receivers: ['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'],
        //         amounts: [100],
        //       },
        //       dummyVoteSettings,
        //       zeroAddress
        //     )
        //   );
        // }}
        disabled={IsButtonDisabled()}
      />
    </div>
  );
};

export default GoLive;

const Container = styled.div.attrs({
  className: 'tablet:mx-auto tablet:w-3/4',
})``;

const ImageContainer = styled.img.attrs({
  className: 'w-25 hidden tablet:block',
})``;
