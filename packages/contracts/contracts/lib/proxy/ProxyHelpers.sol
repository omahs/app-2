/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

library ProxyHelpers {

    function createProxy(address _base, bytes memory _data) internal returns(address) {
        address addr = address(new ERC1967Proxy(_base, _data));
        return addr;
    } 
    
}
