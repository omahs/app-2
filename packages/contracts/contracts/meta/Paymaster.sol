/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity 0.8.10;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@opengsn/contracts/src/BasePaymaster.sol";
import "./../core/acl/ACL.sol";

/// @title The GSN paymaster paying for meta transaction
/// @author Michael Heuer - Aragon Association - 2022
/// @notice This contract pays for meta transactions from and to sponsored addresses
contract Paymaster is BasePaymaster, Initializable, UUPSUpgradeable, ACL {

    bytes32 public constant PAYMASTER_UPGRADE_ROLE = keccak256("PAYMASTER_UPGRADE_ROLE");
    bytes32 public constant PAYMASTER_SPONSORED_ROLE = keccak256("PAYMASTER_SPONSORED_ROLE");

    string private constant ERROR_NOT_SPONSORED = "ERROR_NOT_SPONSORED";
    string private constant ERROR_APPROVAL_DATA_LENGTH_INVALID = "ERROR_APPROVAL_DATA_LENGTH_INVALID";

    /// @dev Used for GSN IPaymaster compatability
    function versionPaymaster() external view override virtual returns (string memory){
        return "0.0.1";
    }

    /// @dev Used for UUPS upgradability pattern
    function initialize(address initialOwner) external initializer {
        ACL.initACL(initialOwner);
    }

    /// @dev Used to check the permissions within the upgradability pattern implementation of OZ
    function _authorizeUpgrade(address) internal virtual override auth(address(this), PAYMASTER_UPGRADE_ROLE) {}

    function postRelayedCall(
        bytes calldata context,
        bool success,
        uint256 gasUseWithoutPost,
        GsnTypes.RelayData calldata relayData
    ) external override virtual {
        (context, success, gasUseWithoutPost, relayData);
    }

    function preRelayedCall(
        GsnTypes.RelayRequest calldata relayRequest,
        bytes calldata signature,
        bytes calldata approvalData,
        uint256 maxPossibleGas
    )
    external
    override
    virtual
    returns (bytes memory context, bool revertOnRecipientRevert) {
        (signature, maxPossibleGas);
        require(approvalData.length == 0, ERROR_APPROVAL_DATA_LENGTH_INVALID);
        require(relayRequest.relayData.paymasterData.length == 0, ERROR_APPROVAL_DATA_LENGTH_INVALID);

        require(
            willPerform(
                relayRequest.request.to,
                relayRequest.request.from,
                PAYMASTER_SPONSORED_ROLE,
                relayRequest.relayData.paymasterData
            ),
            ERROR_NOT_SPONSORED
        );

        return ("", false);
    }
}
