/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.8.0;

interface IACLOracle {
    function willPerform(bytes4 role, address who, bytes calldata data) external returns (bool allowed);
}
