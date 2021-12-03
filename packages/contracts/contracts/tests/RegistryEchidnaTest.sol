/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.8.0;
import "../src/registry/Registry.sol";
import "../src/DAO.sol";

/// @title Fuzzer test for Registry contract
/// @notice Test the register functionalities.
contract RegistryEchidnaTest {
    Registry public registry;
    DAO public dao;

    constructor() {
        registry = new Registry();
        dao = new DAO();
    }

    function echidna_register() external view returns (bool) {
        return address(dao) != address(0) && address(registry) != address(0);
    }
}
