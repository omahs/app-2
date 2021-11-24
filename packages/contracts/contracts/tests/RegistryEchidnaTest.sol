/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.8.0;
import "../src/registry/Registry.sol";
import "../src/DAO.sol";

/// @title Fuzzer test for Registry contract
/// @notice Test the Registry contract functionalities.
contract RegistryEchidnaTest {

    /// @notice Registers a DAO by his name
    function echidna_register() external returns (bool) {
       Registry registry = new Registry();

       DAO dao = new DAO();
       string memory daoName = "hello";
       registry.register(daoName, dao);

       return registry.daos(daoName) == dao;
    }
}
