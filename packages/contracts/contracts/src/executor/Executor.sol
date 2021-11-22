/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

/// @title Implementation of the Executor
/// @author Sarkawt Azad - Aragon Association - 2021
/// @notice This contract represent the execution layer.
contract Executor is UUPSUpgradeable, Initializable {
  event Executed(
    address indexed actor,
    Action[] indexed actions,
    bytes[] execResults
  );

  string private constant ERROR_ACTION_CALL_FAILED = "EXCECUTOR_ACTION_CALL_FAILED";

  struct Action {
    address to; // Address to call.
    uint256 value; // Value to be sent with the call. for example (ETH)
    bytes4 signature; // Selector signiture of the function to be called.
    bytes arguments; // Arguments of the function to be called.
  }

  /// @dev Used for UUPS upgradability pattern
  /// @param executor The executor that can update this contract
  function _authorizeUpgrade(address executor) internal view override {
    require(address(this) == executor, "Only executor can call this!");
  }

  /// @notice If called, the list of provided actions will be executed.
  /// @dev It run a loop through the array of acctions and execute one by one.
  /// @dev If one acction fails, all will be reverted.
  /// @param actions The aray of actions
  function execute(Action[] memory actions) external {
    bytes[] memory execResults = new bytes[](actions.length);

    for (uint256 i = 0; i < actions.length; i++) {
      bytes memory response;
      bool success;

      (success, response) = actions[i].to.call{ value: actions[i].value }(
        abi.encodeWithSelector(actions[i].signature, actions[i].arguments)
      );

      require(success, ERROR_ACTION_CALL_FAILED);

      execResults[i] = response;
    }

    emit Executed(msg.sender, actions, execResults);
  }
}
