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
import "../../lib/permissions/PermissionValidator.sol";
import "../../lib/proxy/ProxyHelpers.sol";

contract DAOFactory {

    using Address for address;
    
    uint256 public constant MAX_VALIDATORS_LENGTH = 10;

    string private constant FACTORY_VALIDATORS_MISMATCH = "FACTORY_VALIDATORS_LENGTH_MISMATCH";
    string private constant FACTORY_VALIDATORS_TOO_MANY = "FACTORY_VALIDATORS_TOO_MANY";

    address private votingBase;
    address private vaultBase;
    address private daoBase;
    address private governanceERC20Base;
    address private governanceWrappedERC20Base;
    address private processesBase;
    address private permissionsBase;
    address private executorBase;

    Registry private registry;

    

    struct PermissionValidators {
        address[] bases;
        bytes[] data;
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
        TokenConfig calldata _tokenConfig,
        PermissionValidators calldata _validators,
        uint256[3] calldata _votingSettings,
        uint256[3] calldata _vaultSettings
    ) external {
        // validate validators length
        require(_validators.bases.length == _validators.data.length, FACTORY_VALIDATORS_MISMATCH);
        require(_validators.bases.length <= MAX_VALIDATORS_LENGTH, FACTORY_VALIDATORS_TOO_MANY);

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

        // Don't call initialize yet as DAO's initialize need contracts
        // that haven't been deployed yet.
        DAO dao = DAO(ProxyHelpers.createProxy(daoBase, bytes("")));
        address voting = ProxyHelpers.createProxy(votingBase, abi.encodeWithSelector(SimpleVoting.initialize.selector, dao, token, _votingSettings));
        address vault = ProxyHelpers.createProxy(vaultBase, abi.encodeWithSelector(Vault.initialize.selector, dao, _vaultSettings));
        address processes = ProxyHelpers.createProxy(processesBase, abi.encodeWithSelector(Processes.initialize.selector, dao));
        address permissions = ProxyHelpers.createProxy(permissionsBase, abi.encodeWithSelector(Permissions.initialize.selector, dao));
        address executor = ProxyHelpers.createProxy(executorBase, abi.encodeWithSelector(Executor.initialize.selector, dao));
        
        dao.initialize(
            _metadata,
            Processes(processes),
            Permissions(permissions),
            Executor(executor),
            address(this) // initial ACL root on DAO itself.
        );  

        // INSTALLING PERMISSION VALIDATORS
        dao.grant(permissions, address(this), Permissions(permissions).PERMISSIONS_ADD_VALIDATOR_ROLE());
        for(uint i = 0; i < _validators.bases.length; i++) {
            address addr = ProxyHelpers.createProxy(
                _validators.bases[i], 
                abi.encodeWithSelector(PermissionValidator.initialize.selector, _validators.data[i])
            );
            Permissions(permissions).addValidator(PermissionValidator(addr));
        }
        dao.revoke(permissions, address(this), Permissions(permissions).PERMISSIONS_ADD_VALIDATOR_ROLE());

        // CREATING FINAL PERMISSIONS
        // The below line means that on any contract's function that has UPGRADE_ROLE, executor will be able to call it.
        dao.grant(address(type(uint160).max), executor, Executor(executor).UPGRADE_ROLE()); // TODO: we can bring address(type(uint160).max) from ACL for consistency.
       
        // vault permissions
        dao.grant(vault, executor, Vault(payable(vault)).TRANSFER_ROLE()); // TODO: do we really need to cast it to payable ? 
        // permissions permissions
        dao.grant(permissions, address(dao), Permissions(permissions).PERMISSIONS_SET_ROLE());
        // processes permissions
        dao.grant(processes, address(dao), Processes(processes).PROCESSES_START_ROLE());
        dao.grant(processes, address(dao), Processes(processes).PROCESSES_SET_ROLE());
        // dao permissions
        dao.grant(address(dao), executor, dao.DAO_CONFIG_ROLE());
        // executor permissions
        dao.grant(executor, voting, Executor(executor).EXEC_ROLE());
        // voting permissions
        dao.grant(voting, processes, SimpleVoting(voting).CREATE_PRIMITIVE_START_ROLE());
        dao.grant(voting, address(dao), SimpleVoting(voting).PRIMITIVE_EXECUTE_ROLE());
        dao.grant(voting, executor, SimpleVoting(voting).MODIFY_SUPPORT_ROLE());
        dao.grant(voting, executor, SimpleVoting(voting).MODIFY_QUORUM_ROLE());
    }

    function setupBases() private {
        votingBase = address(new SimpleVoting());
        vaultBase = address(new Vault());
        daoBase = address(new DAO());
        governanceERC20Base = address(new GovernanceERC20());
        governanceWrappedERC20Base = address(new GovernanceWrappedERC20());
        processesBase = address(new Processes());
        permissionsBase = address(new Permissions());
        executorBase = address(new Executor());
    }
}

