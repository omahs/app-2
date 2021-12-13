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

contract CoreFactory {

    using Address for address;
    
    string private constant FACTORY_VALIDATORS_MISMATCH = "FACTORY_VALIDATORS_LENGTH_MISMATCH";
    string private constant FACTORY_VALIDATORS_TOO_MANY = "FACTORY_VALIDATORS_TOO_MANY";


    address public immutable processesBase;
    address public immutable permissionsBase;
    address public immutable executorBase;

    constructor() {
        processesBase = address(new Processes());
        permissionsBase = address(new Permissions());
        executorBase = address(new Executor());
    }

    function newCore(IDAO _dao) external returns(address, address, address) {
        address processes = ProxyHelpers.createProxy(processesBase, abi.encodeWithSelector(Processes.initialize.selector, _dao));
        address permissions = ProxyHelpers.createProxy(permissionsBase, abi.encodeWithSelector(Permissions.initialize.selector, _dao));
        address executor = ProxyHelpers.createProxy(executorBase, abi.encodeWithSelector(Executor.initialize.selector, _dao));
        
        return (processes, permissions, executor);
    }
}

