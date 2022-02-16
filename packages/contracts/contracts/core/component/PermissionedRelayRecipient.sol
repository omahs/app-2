/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity 0.8.10;

// TODO can we use import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol"; instead?
import "@opengsn/contracts/src/BaseRelayRecipient.sol";

import "./Permissions.sol";

/// @title Abstract implementation of meta transaction compatible DAO permissions
/// @author Michael Heuer - Aragon Association - 2022
/// @notice This contract overrides the auth modifier logic to facilitate GSN meta transactions
/// @dev When your contract inherits from this, it's important to call __Initialize_DAO_Permission with the dao address.
abstract contract PermissionedRelayRecipient is Permissions, BaseRelayRecipient {
    modifier auth(bytes32 _role) override {
        require(dao.hasPermission(address(this), _msgSender(), _role, _msgData()), "component: auth");
        _;
    }
}
