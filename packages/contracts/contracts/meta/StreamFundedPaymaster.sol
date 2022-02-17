/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity 0.8.10;

import "./Paymaster.sol";
import "./ISablier.sol";

/// @title todo
/// @author Michael Heuer - Aragon Association - 2022
/// @notice todo
contract StreamFundedPaymaster is Paymaster {
    ISablier sablier;
    uint256 streamId;

    event StreamChanged(uint256 streamId);
    event StreamWithdraw(uint256 streamId);
    event LogBytes(bytes data);

    error WrongRecipient(address expected, address actual);
    error WithdrawFailed();

    /// @dev Used for UUPS upgradability pattern
    function initialize(
        IDAO _dao,
        ISablier _sablier
    ) public {
        Paymaster.initialize(_dao);
        sablier = _sablier;
    }

    function setStreamId(uint256 _streamId) external {
        (, address recipient,, address token,,,,) = sablier.getStream(_streamId);

        if(recipient != address(this))
            revert WrongRecipient({expected: address(this), actual: recipient});

        streamId = _streamId;

        emit StreamChanged(_streamId);
    }

    function withdrawFromStream(uint256 _streamId) external {
        sablier.withdrawFromStream(_streamId, sablier.balanceOf(_streamId, address(this)));
        emit StreamWithdraw(_streamId);
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
            dao.hasPermission(
                relayRequest.request.to,
                relayRequest.request.from,
                PAYMASTER_SPONSORED_ROLE,
                relayRequest.relayData.paymasterData
            ),
            ERROR_NOT_SPONSORED
        );

        try sablier.withdrawFromStream(streamId, sablier.balanceOf(streamId, address(this))) {
            emit StreamWithdraw(streamId);
        } catch (bytes memory reason) {
            emit LogBytes(reason);
        }

        return ("", false);
    }
}
