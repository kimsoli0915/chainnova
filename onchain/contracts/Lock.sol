// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VCRegistry {
    address public cardCompany; // 카드사 주소

    mapping(bytes32 => bool) public registeredVCs;
    mapping(bytes32 => bool) public usedVCs;

    event VCRegistered(bytes32 indexed vcHash, address indexed registrar);
    event VCUsed(bytes32 indexed vcHash, address indexed user);

    // ✅ 생성자: 카드사 주소를 받아 저장
    constructor(address _cardCompany) {
        cardCompany = _cardCompany;
    }

    // ✅ 카드사만 VC 등록 가능
    function registerVC(bytes32 vcHash) external {
        require(msg.sender == cardCompany, "Only card company can register");
        require(!registeredVCs[vcHash], "VC already registered");
        registeredVCs[vcHash] = true;
        emit VCRegistered(vcHash, msg.sender);
    }

    function isVCRegistered(bytes32 vcHash) external view returns (bool) {
        return registeredVCs[vcHash];
    }

    function isVCUsed(bytes32 vcHash) external view returns (bool) {
        return usedVCs[vcHash];
    }

    function markVCUsed(bytes32 vcHash) external {
        require(!usedVCs[vcHash], "VC already used");
        require(registeredVCs[vcHash], "VC not registered");
        usedVCs[vcHash] = true;
        emit VCUsed(vcHash, msg.sender);
    }
}
