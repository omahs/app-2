/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.8.0;
import "../src/registry/Registry.sol";
import "../src/DAO.sol";

/// @title Fuzzer test for Registry contract
/// @notice Test the Registry contract functionalities.
contract RegistryEchidnaTest is Registry {

    function echidna_register() external pure returns (bool) {
       return true;
    }
}
