import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { TASK_ETHERSCAN_VERIFY } from 'hardhat-deploy'

import { verifyContract } from '../utils/etherscan'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, run } = hre

  console.log('Verifying registry and factories contracts')

  console.log(
    'Waiting for 1 minutes so Etherscan is aware of contracts before verifying'
  )
  await delay(6000) // Etherscan needs some time to process before trying to verify.
  console.log('Starting to verify now')

  await run(TASK_ETHERSCAN_VERIFY, {
    apiKey: process.env.ETHERSCAN_KEY, // todo : replace from .env
    license: 'GPL-3.0',
    solcInput: true,
  })

  console.log('Verifying factories base contracts')

  const DAOFactoryContract = await ethers.getContractAt(
      'DAOFactory',
      (await deployments.get('DAOFactory')).address
  )
  const coreFactoryContract = await ethers.getContractAt(
    'CoreFactory',
    (await deployments.get('CoreFactory')).address
  )
  const tokenFactoryContract = await ethers.getContractAt(
    'TokenFactory',
    (await deployments.get('TokenFactory')).address
  )

  const votingBase = await DAOFactoryContract.votingBase();
  const vaultBase = await DAOFactoryContract.vaultBase();

  const permissionBase = await coreFactoryContract.permissionsBase();
  const executorBase = await coreFactoryContract.executorBase();
  const processesBase = await coreFactoryContract.processesBase();

  const governanceERC20Base = await tokenFactoryContract.governanceERC20Base();
  const governanceWrappedERC20Base = await tokenFactoryContract.governanceWrappedERC20Base();


  await verifyContract(votingBase, [])
  await verifyContract(vaultBase, [])
  await verifyContract(permissionBase, [])
  await verifyContract(executorBase, [])
  await verifyContract(processesBase, [])
  await verifyContract(governanceERC20Base, [])
  await verifyContract(governanceWrappedERC20Base, [])
}
export default func
func.runAtTheEnd = true
func.dependencies = [
  'DAOFactory',
  'TokenFactory',
  'CoreFactory'
]
func.skip = (hre: HardhatRuntimeEnvironment) =>
  Promise.resolve(
    hre.network.name === 'localhost' ||
      hre.network.name === 'hardhat' ||
      hre.network.name === 'coverage'
  )
