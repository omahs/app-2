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
import "./TokenFactory.sol";
import "./CoreFactory.sol";
import "../processes/Processes.sol";
import "../permissions/Permissions.sol";
import "../executor/Executor.sol";
import "../../lib/permissions/PermissionValidator.sol";
import "../../lib/proxy/ProxyHelpers.sol";

contract DAOFactory {

    using Address for address;
    
    string private constant FACTORY_VALIDATORS_MISMATCH = "FACTORY_VALIDATORS_LENGTH_MISMATCH";
    string private constant FACTORY_VALIDATORS_TOO_MANY = "FACTORY_VALIDATORS_TOO_MANY";

    address public immutable daoBase;
    address public immutable votingBase;
    address public immutable vaultBase;

    Registry public immutable registry;
    TokenFactory public immutable tokenFactory;
    CoreFactory public immutable coreFactory;

    constructor(
        Registry _registry,
        TokenFactory _tokenFactory,
        CoreFactory _coreFactory
    ) {
        registry = _registry;
        tokenFactory = _tokenFactory;
        coreFactory = _coreFactory;

        votingBase = address(new SimpleVoting());
        vaultBase = address(new Vault());
        daoBase = address(new DAO());
    }

    function newDAO(
        string calldata _name,
        bytes calldata _metadata,
        TokenFactory.TokenConfig calldata _tokenConfig,
        uint256[3] calldata _votingSettings
    ) external {
        address token = tokenFactory.newToken(_tokenConfig);

        DAO dao = DAO(ProxyHelpers.createProxy(daoBase, bytes("")));

        // TODO: The voting/vault should be installed through installer(marketplace)
        address voting = ProxyHelpers.createProxy(votingBase, abi.encodeWithSelector(SimpleVoting.initialize.selector, dao, token, _votingSettings));
        address vault = ProxyHelpers.createProxy(vaultBase, abi.encodeWithSelector(Vault.initialize.selector, dao));

        (address processes, address permissions, address executor) = coreFactory.newCore(dao);
        
        dao.initialize(
            _metadata,
            Processes(processes),
            Permissions(permissions),
            Executor(executor),
            address(this) // initial ACL root on DAO itself.
        );  

        // CREATING FINAL PERMISSIONS
        // The below line means that on any contract's function that has UPGRADE_ROLE, 
        // executor will be able to call it, unless changedd specifically.
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

        registry.register(
            _name,
            msg.sender, 
            dao,
            token,
            SimpleVoting(voting),
            Vault(payable(vault)),
            Executor(executor),
            Processes(processes),
            Permissions(permissions)
        );
    }
}

