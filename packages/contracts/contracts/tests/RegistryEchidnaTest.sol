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
    string public daoName;

    constructor() {
        registry = new Registry();
        dao = new DAO();
        daoName = "hello";
        registry.register(daoName, dao);
    }

    function echidna_register() external view returns (bool) {
        return address(dao) != address(0) && registry.daos(daoName) == dao;
    }
}
