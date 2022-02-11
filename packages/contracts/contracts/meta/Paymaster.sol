/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity 0.8.10;

import "@opengsn/contracts/src/BasePaymaster.sol";

contract Paymaster is BasePaymaster  {

    bool public useSenderWhitelist;
    bool public useTargetWhitelist;
    mapping (address=>bool) public senderWhitelist;
    mapping (address=>bool) public targetWhitelist;

    function versionPaymaster() external view override virtual returns (string memory){
        return "2.2.3+opengsn.accepteverything.ipaymaster";
    }

    function postRelayedCall(
        bytes calldata context,
        bool success,
        uint256 gasUseWithoutPost,
        GsnTypes.RelayData calldata relayData
    ) external override virtual {
        (context, success, gasUseWithoutPost, relayData);
    }
    
    function whitelistSender(address sender) public onlyOwner {
        senderWhitelist[sender]=true;
        useSenderWhitelist = true;
    }
    function whitelistTarget(address target) public onlyOwner {
        targetWhitelist[target]=true;
        useTargetWhitelist = true;
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
        require(approvalData.length == 0, "approvalData: invalid length");
        require(relayRequest.relayData.paymasterData.length == 0, "paymasterData: invalid length");

        if ( useSenderWhitelist ) {
            require( senderWhitelist[relayRequest.request.from], "sender not whitelisted");
        }
        if ( useTargetWhitelist ) {
            require( targetWhitelist[relayRequest.request.to], "target not whitelisted");
        }
        return ("", false);
    }
}
