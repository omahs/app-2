/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.8.0;

import "../../DAO.sol";

contract Marketplace {
    
    string private constant ERROR_INVALID_BUMP = "MARKETPLACE_INVALID_BUMP";

    struct Version {
        uint16[3] semanticVersion;
        address contractAddress;
        bytes contentURI; // contains metadata.json, arapp.json, ui folder. 
    }
    
    /** The storage flow about new app registering.
    versionsNextIndex
        Voting
            3 (gets incremented)
    versions
        Voting
            0 => { base1, cid1, 0.1.0}
            1 => { base1, cid2, 0.1.1}
            2 => { base2, cid3, 1.0.0}

    versionIdForSemantic
        Voting
            0.1.0 => 0
            0.1.1 => 1
            1.0.0 => 2

    latestVersionIdForContract
        Voting
            base1 => 0
            base1 => 1
            base2 => 2
    */
    mapping (bytes32 => uint256) internal versionsNextIndex; 
    mapping (bytes32 => mapping(uint256 => Version)) internal versions;
    mapping (bytes32 => mapping(bytes32 => uint256)) internal versionIdForSemantic;
    mapping (bytes32 => mapping(address => uint256)) internal latestVersionIdForContract;

    event RegisterNewApp(bytes32 appName, uint256 versionId);
    event InstallAppOnDAO(address dao, bytes32 appName, address base);


    // TODO: need the permission by only Aragon.. do we create a new DAO which will worry about it
    // or this contract implements ACL on its own and have permissions like that ?
    
    // This will be called by Aragon just to put an app on the marketplace and emit the event
    // so front-end can fetch the information. If the app is not 3rd party, probably, it
    // won't contain uiCid since the front-end logic will be inside our front-end.
    function registerApp(
        bytes32 _appName, 
        address _baseContract, 
        bytes memory _contentURI,
        uint16[3] memory _newSemanticVersion
    ) external {
        uint lastVersionIndex = versionsNextIndex[_appName];
        Version storage lastVersion = versions[_appName][lastVersionIndex];
        uint16[3] memory lastSemanticVersion = lastVersion.semanticVersion;

        require(isValidBump(lastSemanticVersion, _newSemanticVersion), ERROR_INVALID_BUMP);

        uint256 versionId = versionsNextIndex[_appName]++;
        versions[_appName][versionId] = Version(_newSemanticVersion, _baseContract, _contentURI);

        versionIdForSemantic[_appName][semanticVersionHash(_newSemanticVersion)] = versionId;
        latestVersionIdForContract[_appName][_baseContract] = versionId;

        emit RegisterNewApp(_appName, versionId);
    }

    function getLatest(bytes32 _appName) 
        public 
        view 
        returns (uint16[3] memory semanticVersion, address contractAddress, bytes memory contentURI)
    {
        return getByVersionId(_appName, versionsNextIndex[_appName]);
    }

    function getLatestForContractAddress(bytes32 _appName, address _contractAddress)
        public
        view
        returns (uint16[3] memory semanticVersion, address contractAddress, bytes memory contentURI)
    {
        return getByVersionId(_appName, latestVersionIdForContract[_appName][_contractAddress]);
    }

    function getBySemanticVersion(bytes32 _appName, uint16[3] memory _semanticVersion)
        public
        view
        returns (uint16[3] memory semanticVersion, address contractAddress, bytes memory contentURI)
    {
        return getByVersionId(_appName, versionIdForSemantic[_appName][semanticVersionHash(_semanticVersion)]);
    }

    function getByVersionId(bytes32 _appName, uint _versionId) 
        public 
        view 
        returns (uint16[3] memory semanticVersion, address contractAddress, bytes memory contentURI) 
    {
        Version storage version = versions[_appName][_versionId];
        return (version.semanticVersion, version.contractAddress, version.contentURI);
    }

    function getVersionsCount(bytes32 _appName) public view returns (uint256) {
        return versionsNextIndex[_appName];
    }
    
    // installs latest version of app.
    function installOnDAO(address dao, bytes32 _appName) external {
        require(versions[_appName][0].contractAddress != address(0), "App Doesn't exist");
        (, address contractAddress, ) = getLatest(_appName);
        emit InstallAppOnDAO(dao, _appName, contractAddress);
    }

    function isValidBump(uint16[3] memory _oldVersion, uint16[3] memory _newVersion) public pure returns (bool) {
        bool hasBumped;
        uint i = 0;
        while (i < 3) {
            if (hasBumped) {
                if (_newVersion[i] != 0) {
                    return false;
                }
            } else if (_newVersion[i] != _oldVersion[i]) {
                if (_oldVersion[i] > _newVersion[i] || _newVersion[i] - _oldVersion[i] != 1) {
                    return false;
                }
                hasBumped = true;
            }
            i++;
        }
        return hasBumped;
    }

    function semanticVersionHash(uint16[3] memory version) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(version[0], version[1], version[2]));
    }

}
