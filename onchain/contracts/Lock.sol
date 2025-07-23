// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VCRegistry {
    mapping(bytes32 => bool) public registeredVCs;

    event VCRegistered(bytes32 indexed vcHash, address indexed registrar);

    function registerVC(bytes32 vcHash) external {
        require(!registeredVCs[vcHash], "VC already registered");
        registeredVCs[vcHash] = true;
        emit VCRegistered(vcHash, msg.sender);
    }

    function isVCRegistered(bytes32 vcHash) external view returns (bool) {
        return registeredVCs[vcHash];
    }
}
