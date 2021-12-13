/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.8.0;

import "../DAO.sol";
import "../vault/Vault.sol";
import "../../lib/governance-primitives/voting/VotingGovernancePrimitive.sol";
import "../vault/Vault.sol";
import "../vault/Vault.sol";

/// @title Register your unique DAO name
/// @author Samuel Furter - Aragon Association - 2021
/// @notice This contract provides the possiblity to register a DAO by a unique name.
contract Registry {
    event NewDAO(
        string indexed name, 
        address indexed creator,
        DAO indexed dao,
        address token,
        VotingGovernancePrimitive voting,
        Vault vault,
        Executor executor,
        Processes processes,
        Permissions permissions
    );

    mapping(string => DAO) public daos;

    /// @notice Registers a DAO by his name
    /// @dev A name is unique within the Aragon DAO framework and can get stored here
    /// @param name The name of the DAO
    /// @param dao The address of the DAO contract
    function register(
        string calldata name, 
        address sender,
        DAO dao,
        address token,
        VotingGovernancePrimitive voting,
        Vault vault,
        Executor executor,
        Processes processes,
        Permissions permissions
        ) external {
        require(daos[name] == DAO(address(0)), "Name in use");

        daos[name] = dao;
        
        emit NewDAO(
            name, 
            sender,
            dao,
            token,
            voting,
            vault,
            executor,
            processes,
            permissions
        );
    }
}
