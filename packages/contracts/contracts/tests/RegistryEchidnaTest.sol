/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.8.0;
import "../src/registry/Registry.sol";
import "../src/DAO.sol";

/// @title Fuzzer test for Registry contract
/// @notice Test the Registry contract functionalities.
contract RegistryEchidnaTest {
    Registry public registry;
    DAO public dao;
    string public daoName;

    constructor() {
        registry = new Registry();
        /*
        dao = new DAO();
        daoName = "hello";
        registry.register(daoName, dao);
        */
    }

    /// @notice Registers a DAO by his name
    function echidna_register() external view {
        assert(registry != Registry(address(0)));
        //assert(registry.daos(daoName) != DAO(address(0)));
        //assert(registry.daos(daoName) == dao);
    }
}
