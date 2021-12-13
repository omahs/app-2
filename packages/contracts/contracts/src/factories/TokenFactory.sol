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

contract TokenFactory {

    using Address for address;
    
    string private constant FACTORY_VALIDATORS_MISMATCH = "FACTORY_VALIDATORS_LENGTH_MISMATCH";
    string private constant FACTORY_VALIDATORS_TOO_MANY = "FACTORY_VALIDATORS_TOO_MANY";

    address public immutable governanceERC20Base;
    address public immutable governanceWrappedERC20Base;
  
    struct TokenConfig {
        address addr;
        string name;
        string symbol;
    }

    constructor() {
        governanceERC20Base = address(new GovernanceERC20());
        governanceWrappedERC20Base = address(new GovernanceWrappedERC20());
    }

    function newToken(TokenConfig calldata _tokenConfig) external returns(address) {
        // setup Token
        // TODO: Do we wanna leave the option not to use any proxy pattern in such case ? 
        // delegateCall is costly if so many calls are needed for a contract after the deployment.
        address token = _tokenConfig.addr;
        if(token == address(0)) {
            token = Clones.clone(governanceERC20Base);
            GovernanceERC20(token).initialize(_tokenConfig.name, _tokenConfig.symbol);
        } else {
            token = Clones.clone(governanceWrappedERC20Base);
            // user already has a token. we need to wrap it in our new token to make it governance token.
            GovernanceWrappedERC20(token).initialize(IERC20Upgradeable(_tokenConfig.addr), _tokenConfig.name, _tokenConfig.symbol);
        }
        return token;
    }
}

