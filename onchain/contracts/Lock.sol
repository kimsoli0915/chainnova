// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VCRegistry {
// 등록된 VC 여부 확인
mapping(bytes32 => bool) public registeredVCs;

// 사용된 VC 여부 확인
mapping(bytes32 => bool) public usedVCs;

// 등록 이벤트
event VCRegistered(bytes32 indexed vcHash, address indexed registrar);

// 사용 처리 이벤트
event VCUsed(bytes32 indexed vcHash, address indexed user);

// VC 등록 함수
function registerVC(bytes32 vcHash) external {
    require(!registeredVCs[vcHash], "VC already registered");
    registeredVCs[vcHash] = true;
    emit VCRegistered(vcHash, msg.sender);
}

// VC 등록 여부 조회
function isVCRegistered(bytes32 vcHash) external view returns (bool) {
    return registeredVCs[vcHash];
}

// VC 사용 여부 조회
function isVCUsed(bytes32 vcHash) external view returns (bool) {
    return usedVCs[vcHash];
}

// VC 사용 처리
function markVCUsed(bytes32 vcHash) external {
    require(!usedVCs[vcHash], "VC already used");
    require(registeredVCs[vcHash], "VC not registered");
    usedVCs[vcHash] = true;
    emit VCUsed(vcHash, msg.sender);
}
}