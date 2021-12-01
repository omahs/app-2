/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../DAO.sol";
import "../vault/Vault.sol";
import "../governance-primitives/voting/SimpleVoting.sol";
import "../tokens/GovernanceERC20.sol";
import "../tokens/GovernanceWrappedERC20.sol";
import "../registry/Registry.sol";
import "../processes/Processes.sol";
import "../permissions/Permissions.sol";
import "../executor/Executor.sol";

contract DAOFactory {

    using Address for address;
    
    address private daoBase;
    address private governanceERC20Base;
    address private governanceWrappedERC20Base;
    address private processesBase;
    address private permissionsBase;
    address private executorBase;

    Registry private registry;

    struct App {
        address votingBase;
        address vaultBase;
        bytes votingData;
        bytes vaultData;
    }

    struct TokenConfig {
        address addr;
        string name;
        string symbol;
    }

    constructor(Registry _registry) {
        registry = _registry;
        setupBases();
    }

    function newDAO(
        bytes calldata _metadata,
        App calldata apps,
        TokenConfig calldata _tokenConfig
    ) external {
        // setup Token
        // TODO: Do we wanna leave the option not to use any proxy pattern in such case ? 
        // delegateCall is costly if so many calls are needed for a contract after the deployment.
        address token = _tokenConfig.addr;
        // https://forum.openzeppelin.com/t/what-is-the-best-practice-for-initializing-a-clone-created-with-openzeppelin-contracts-proxy-clones-sol/16681
        if(token == address(0)) {
            token = Clones.clone(governanceERC20Base);
            GovernanceERC20(token).initialize(_tokenConfig.name, _tokenConfig.symbol);
        } else {
            token = Clones.clone(governanceWrappedERC20Base);
            // user already has a token. we need to wrap it in our new token to make it governance token.
            GovernanceWrappedERC20(token).initialize(IERC20Upgradeable(_tokenConfig.addr), _tokenConfig.name, _tokenConfig.symbol);
        }

        // Creates necessary contracts for dao.

        // Don't call initialize yet as DAO's initialize need contracts
        // that haven't been deployed yet.
        DAO dao = DAO(createProxy(daoBase, bytes("")));
        
        address processes = createProxy(processesBase, abi.encodeWithSelector(Processes.initialize.selector, dao));
        address permissions = createProxy(permissionsBase, abi.encodeWithSelector(Permissions.initialize.selector, dao));
        address executor = createProxy(executorBase, abi.encodeWithSelector(Executor.initialize.selector, dao));
        address vault;
        address voting;

        dao.initialize(
            _metadata,
            Processes(processes),
            Permissions(permissions),
            Executor(executor),
            address(this) // initial ACL root on DAO itself.
        );
        
        // The below line means that on any contract's function that has UPGRADE_ROLE, executor will be able to call it.
        dao.grant(address(type(uint160).max), executor, Executor(executor).UPGRADE_ROLE()); // TODO: we can bring address(type(uint160).max) from ACL for consistency.
       
        // TODO; the below vaultBase and votingBase shouldn't be here. The reason is that
        // if we allow different bases for those 2, then one of the base mightn't have TRANSFER_ROLE at all
        // and hardcoding roles here is a big mistake.
        // if(apps.vaultBase != address(0)) {
        //     vault = createProxy(apps.vaultBase, abi.encode(dao, apps.vaultData));
        //     dao.grant(vault, executor, Vault(payable(vault)).TRANSFER_ROLE()); // TODO: do we really need to cast it to payable ?
        // }

        // if(apps.votingBase != address(0)) {
        //     voting = createProxy(apps.votingBase, abi.encode(dao, apps.votingData));
        //     dao.grant(voting, processes, SimpleVoting(voting).CREATE_PRIMITIVE_START_ROLE());
        //     dao.grant(voting, address(dao), SimpleVoting(voting).PRIMITIVE_EXECUTE_ROLE());
        //     dao.grant(voting, executor, SimpleVoting(voting).MODIFY_SUPPORT_ROLE());
        //     dao.grant(voting, executor, SimpleVoting(voting).MODIFY_QUORUM_ROLE());
        //     dao.grant(executor, voting, Executor(executor).EXEC_ROLE());
        // }

        // permissions permissions
        dao.grant(permissions, address(dao), Permissions(permissions).PERMISSIONS_SET_ROLE());
        // processes permissions
        dao.grant(processes, address(dao), Processes(processes).PROCESSES_START_ROLE());
        dao.grant(processes, address(dao), Processes(processes).PROCESSES_SET_ROLE());
        // dao permissions
        dao.grant(address(dao), executor, dao.DAO_CONFIG_ROLE());    
    }

    function createProxy(address _logic, bytes memory _data) private returns(address) {
        return address(new ERC1967Proxy(_logic, _data));
    }

    function setupBases() private {
        daoBase = address(new DAO());
        governanceERC20Base = address(new GovernanceERC20());
        governanceWrappedERC20Base = address(new GovernanceWrappedERC20());
        processesBase = address(new Processes());
        permissionsBase = address(new Permissions());
        executorBase = address(new Executor());
    }
}

