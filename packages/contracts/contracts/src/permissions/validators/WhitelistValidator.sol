/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.8.0;

import "../../../lib/permissions/PermissionValidator.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WhitelistValidator is PermissionValidator {

    mapping(address => bool) public whitelist;

    function initialize(bytes memory data) external override {
        //
    }

    function isValid(address caller, bytes memory /* data */) external view override returns(bool) {
        return whitelist[caller];
    }

    function addToWhitelist(address[] memory users) external {
        for(uint i = 0; i < users.length; i++) {
            whitelist[users[i]] = true;
        }
    }
    
}
