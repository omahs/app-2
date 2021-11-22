/*
 * SPDX-License-Identifier:    MIT
 */
/**
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "../../../lib/governance-primitives/voting/VotingGovernancePrimitive.sol";
import "../../DAO.sol";

contract SimpleVoting is VotingGovernancePrimitive {
    
    uint64 public constant PCT_BASE = 10 ** 18; // 0% = 0; 1% = 10^16; 100% = 10^18

    // TODO: grab this from the data lib.
    struct Action {
        address to;
        uint256 value;
        bytes data;
    }

    enum VoterState { Absent, Yea, Nay }

    struct Vote {
        bool executed;
        uint64 startDate;
        uint64 snapshotBlock;
        uint64 supportRequiredPct;
        uint64 minAcceptQuorumPct;
        uint256 yea;
        uint256 nay;
        uint256 votingPower;
        Action[] actions;
        mapping (address => VoterState) voters;
    }

    mapping (uint256 => Vote) internal votes;
    uint256 public votesLength;
    

    uint64 public supportRequiredPct;
    uint64 public minAcceptQuorumPct;
    uint64 public voteTime;

    ERC20VotesUpgradeable public token;
    DAO public dao;
    
    string private constant ERROR_NO_VOTE = "VOTING_NO_VOTE";
    string private constant ERROR_INIT_PCTS = "VOTING_INIT_PCTS";
    string private constant ERROR_CHANGE_SUPPORT_PCTS = "VOTING_CHANGE_SUPPORT_PCTS";
    string private constant ERROR_CHANGE_QUORUM_PCTS = "VOTING_CHANGE_QUORUM_PCTS";
    string private constant ERROR_INIT_SUPPORT_TOO_BIG = "VOTING_INIT_SUPPORT_TOO_BIG";
    string private constant ERROR_CHANGE_SUPPORT_TOO_BIG = "VOTING_CHANGE_SUPP_TOO_BIG";
    string private constant ERROR_CAN_NOT_VOTE = "VOTING_CAN_NOT_VOTE";
    string private constant ERROR_CAN_NOT_EXECUTE = "VOTING_CAN_NOT_EXECUTE";
    string private constant ERROR_CAN_NOT_FORWARD = "VOTING_CAN_NOT_FORWARD";
    string private constant ERROR_NO_VOTING_POWER = "VOTING_NO_VOTING_POWER";

    event StartVote(uint256 indexed voteId, address indexed creator, string description);
    event CastVote(uint256 indexed voteId, address indexed voter, bool voterSupports, uint256 stake);
    event ExecuteVote(uint256 indexed voteId);
    event ChangeSupportRequired(uint64 supportRequiredPct);
    event ChangeMinQuorum(uint64 minAcceptQuorumPct);

    modifier voteExists(uint256 _voteId) {
        require(_voteId < votesLength, ERROR_NO_VOTE);
        _;
    }

    // TODO: @Giorgi check inheritance cause of initialize
    function initialize(DAO _dao, ERC20VotesUpgradeable _token, uint64[3] calldata _voteSettings) external initializer { 
        dao = _dao;
        token = _token;

        require(_voteSettings[0] <= _voteSettings[1], ERROR_INIT_PCTS);
        require(_voteSettings[1] < PCT_BASE, ERROR_INIT_SUPPORT_TOO_BIG);

        minAcceptQuorumPct = _voteSettings[0];
        supportRequiredPct = _voteSettings[1]; 
        voteTime = _voteSettings[2];
    }
*/
    /**
    * @notice Change required support to `@formatPct(_supportRequiredPct)`%
    * @param _supportRequiredPct New required support
    */
    /**
    function changeSupportRequiredPct(uint64 _supportRequiredPct) external {
        require(minAcceptQuorumPct <= _supportRequiredPct, ERROR_CHANGE_SUPPORT_PCTS);
        require(_supportRequiredPct < PCT_BASE, ERROR_CHANGE_SUPPORT_TOO_BIG);
        supportRequiredPct = _supportRequiredPct;

        emit ChangeSupportRequired(_supportRequiredPct);
    }
*/
    /**
    * @notice Change minimum acceptance quorum to `@formatPct(_minAcceptQuorumPct)`%
    * @param _minAcceptQuorumPct New acceptance quorum
    */
/**
    function changeMinAcceptQuorumPct(uint64 _minAcceptQuorumPct) external {
        require(_minAcceptQuorumPct <= supportRequiredPct, ERROR_CHANGE_QUORUM_PCTS);
        minAcceptQuorumPct = _minAcceptQuorumPct;

        emit ChangeMinQuorum(_minAcceptQuorumPct);
    }
 */
    // function start(Data.ProposalSubmission calldata proposal) public override returns (uint256 voteId) {
    //     (Action[] memory actions, string memory description, bool executeIfDecided) = abi.decode(proposal.data, [Action[], string, bool]);

    //     uint64 snapshotBlock = block.number - 1; // TODO:
        
    //     uint256 votingPower = token.totalSupplyAt(snapshotBlock);
    //     require(votingPower > 0, ERROR_NO_VOTING_POWER);

    //     voteId = votesLength++;

    //     Vote storage vote_ = votes[voteId];
    //     vote_.startDate = block.timestamp; // TODO:
    //     vote_.snapshotBlock = snapshotBlock;
    //     vote_.supportRequiredPct = supportRequiredPct;
    //     vote_.minAcceptQuorumPct = minAcceptQuorumPct;
    //     vote_.votingPower = votingPower;
    //     vote_.actions = proposal.actions;

    //     emit StartVote(voteId, msg.sender, description);
        
    //     // TODO: 
    //     // 1. do we wanna add one more if which will decide if 
    //     // the creator of the vote should vote or not immediatelly.
    //     if (_canVote(voteId, msg.sender)) {
    //         _vote(voteId, true, msg.sender, executeIfDecided);
    //     }
        
    // }

    //function start(Data.ProposalSubmission calldata proposal) public override {
        // (Action[] memory actions, string memory description, bool executeIfDecided) = abi.decode(proposal.data, [Action[], string, bool]);

        // uint64 snapshotBlock = block.number - 1; // TODO:
        
        // uint256 votingPower = token.totalSupplyAt(snapshotBlock);
        // require(votingPower > 0, ERROR_NO_VOTING_POWER);

        // voteId = votesLength++;

        // Vote storage vote_ = votes[voteId];
        // vote_.startDate = block.timestamp; // TODO:
        // vote_.snapshotBlock = snapshotBlock;
        // vote_.supportRequiredPct = supportRequiredPct;
        // vote_.minAcceptQuorumPct = minAcceptQuorumPct;
        // vote_.votingPower = votingPower;
        // vote_.actions = proposal.actions;

        // emit StartVote(voteId, msg.sender, description);
        
        // // TODO: 
        // // 1. do we wanna add one more if which will decide if 
        // // the creator of the vote should vote or not immediatelly.
        // if (_canVote(voteId, msg.sender)) {
        //     _vote(voteId, true, msg.sender, executeIfDecided);
        // }
        
    //}

    // function vote(uint256 _voteId, bool _supports, bool _executesIfDecided) public override voteExists(_voteId) {
    //     require(_canVote(_voteId, msg.sender), ERROR_CAN_NOT_VOTE);
    //     _vote(_voteId, _supports, msg.sender, _executesIfDecided);
    // }

    // TODO: this is to allow interface not fail. Remove this and replace with the above later
    //function vote(bytes calldata data) public override  {

    //}

    // function execute(uint256 _voteId) public override voteExists(_voteId) {
    //     _executeVote(_voteId);
    // }
    // TODO: this is to allow interface not fail. Remove this and replace with the above later
    //function _execute() public override  {
    //}

    /**
    * @dev Return the state of a voter for a given vote by its ID
    * @param _voteId Vote identifier
    * @return VoterState of the requested voter for a certain vote
    */
    //function getVoterState(uint256 _voteId, address _voter) public view voteExists(_voteId) returns (VoterState) {
    //    return votes[_voteId].voters[_voter];
    //}

    //function canVote(uint256 _voteId, address _voter) public view voteExists(_voteId) returns (bool) {
    //    return _canVote(_voteId, _voter);
    //}
/*
    function getVote(uint256 _voteId)
        public
        view
        voteExists(_voteId)
        returns (
            bool open,
            bool executed,
            uint64 startDate,
            uint64 snapshotBlock,
            uint64 supportRequired,
            uint64 minAcceptQuorum,
            uint256 yea,
            uint256 nay,
            uint256 votingPower,
            Action[] memory actions
        )
    {
        Vote storage vote_ = votes[_voteId];

        open = _isVoteOpen(vote_);
        executed = vote_.executed;
        startDate = vote_.startDate;
        snapshotBlock = vote_.snapshotBlock;
        supportRequired = vote_.supportRequiredPct;
        minAcceptQuorum = vote_.minAcceptQuorumPct;
        yea = vote_.yea;
        nay = vote_.nay;
        votingPower = vote_.votingPower;
        actions = vote_.actions;
    }

    
    // =========================== INTERNAL/PRIVATE FUNCTIONS =====================================
*/
    /**
    * @dev Internal function to execute a vote. It assumes the queried vote exists.
    */
    /*
    function _executeVote(uint256 _voteId) internal {
        require(_canExecute(_voteId), ERROR_CAN_NOT_EXECUTE);
        
        Vote storage vote_ = votes[_voteId];

        vote_.executed = true;

        // TODO: vote.actions (pass this to executor and do we also want voting
        // to have allowFailureMap for voting
        emit ExecuteVote(_voteId);
    }*/


    /**
    * @dev Internal function to cast a vote. It assumes the queried vote exists.
    *//*
    function _vote(uint256 _voteId, bool _supports, address _voter, bool _executesIfDecided) internal {
        Vote storage vote_ = votes[_voteId];

        // This could re-enter, though we can assume the governance token is not malicious
        uint256 voterStake = token.getPastVotes(_voter, vote_.snapshotBlock);
        VoterState state = vote_.voters[_voter];

        // If voter had previously voted, decrease count
        if (state == VoterState.Yea) {
            vote_.yea = vote_.yea - voterStake;
        } else if (state == VoterState.Nay) {
            vote_.nay = vote_.nay - voterStake;
        }

        if (_supports) {
            vote_.yea = vote_.yea + voterStake;
        } else {
            vote_.nay = vote_.nay + voterStake;
        }

        vote_.voters[_voter] = _supports ? VoterState.Yea : VoterState.Nay;

        emit CastVote(_voteId, _voter, _supports, voterStake);

        if (_executesIfDecided && _canExecute(_voteId)) {
           _executeVote(_voteId);
        }
    }
/*
    /**
    * @dev Internal function to check if a voter can participate on a vote. It assumes the queried vote exists.
    * @return True if the given voter can participate a certain vote, false otherwise
    *//*
    function _canVote(uint256 _voteId, address _voter) internal view returns (bool) {
        Vote storage vote_ = votes[_voteId];
        return _isVoteOpen(vote_) && token.getPastVotes(_voter, vote_.snapshotBlock) > 0;
    }
*/
    /**
    * @dev Internal function to check if a vote is still open
    * @return True if the given vote is open, false otherwise
    */
    /*
    function _isVoteOpen(Vote storage vote_) internal view returns (bool) {
        return block.timestamp < vote_.startDate + voteTime && !vote_.executed; // TODO:
    }*/

    /**
    * @dev Internal function to check if a vote can be executed. It assumes the queried vote exists.
    * @return True if the given vote can be executed, false otherwise
    */
    /*
    function _canExecute(uint256 _voteId) internal view returns (bool) {
        Vote storage vote_ = votes[_voteId];

        if (vote_.executed) {
            return false;
        }

        // Voting is already decided
        if (_isValuePct(vote_.yea, vote_.votingPower, vote_.supportRequiredPct)) {
            return true;
        }

        // Vote ended?
        if (_isVoteOpen(vote_)) {
            return false;
        }
        // Has enough support?
        uint256 totalVotes = vote_.yea + vote_.nay;
        if (!_isValuePct(vote_.yea, totalVotes, vote_.supportRequiredPct)) {
            return false;
        }
        // Has min quorum?
        if (!_isValuePct(vote_.yea, vote_.votingPower, vote_.minAcceptQuorumPct)) {
            return false;
        }

        return true;
    }
*/
    /**
    * @dev Calculates whether `_value` is more than a percentage `_pct` of `_total`
    */
    //function _isValuePct(uint256 _value, uint256 _total, uint256 _pct) internal pure returns (bool) {
    //    if (_total == 0) {
    //        return false;
    //    }
    //
    //    uint256 computedPct = _value * PCT_BASE / _total;
    //    return computedPct > _pct;
    // }
// }
