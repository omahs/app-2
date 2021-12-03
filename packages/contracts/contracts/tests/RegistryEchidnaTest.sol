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
        //dao = new DAO();
        dao = DAO(address(registry));
    }

    function echidna_register() external returns (bool) {
        string memory name = "hello";
        registry.register(name, dao);
        return registry.daos(name) == dao && address(dao) != address(0);
    }
}
