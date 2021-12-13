import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  const registry = await deployments.get('Registry')

  const coreFactory = await deploy('CoreFactory', {
      from: deployer,
      log: true
  })

  const tokenFactory = await deploy('TokenFactory', {
    from: deployer,
    log: true
  })

  await deploy('DAOFactory', {
    from: deployer,
    args: [
      registry.address,
      tokenFactory.address,
      coreFactory.address
    ],
    log: true,
  })
}
export default func
func.tags = [
  'DAOFactory',
  'TokenFactory',
  'CoreFactory'
]
func.dependencies = ['Registry']
