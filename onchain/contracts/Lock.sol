pragma solidity ^0.8.20;

contract VCRegistry {
    address public cardCompany; // 카드사 주소
// VC 해시값을 기준으로 등록 여부와 사용 여부를 저장
    mapping(bytes32 => bool) public registeredVCs;
    mapping(bytes32 => bool) public usedVCs;
// VC 등록 및 사용 시 기록
    event VCRegistered(bytes32 indexed vcHash, address indexed registrar);
    event VCUsed(bytes32 indexed vcHash, address indexed user);

    // 생성자 : 카드사 주소를 받아 저장
    constructor(address _cardCompany) {
        cardCompany = _cardCompany;
    }

    // VC 등록 
     function registerVC(bytes32 vcHash) external {
        require(msg.sender == cardCompany, "Only card company can register"); // 카드사만 등록 가능
        require(!registeredVCs[vcHash], "VC already registered"); // 중복 등록 방지
        registeredVCs[vcHash] = true; // 등록 처리
        emit VCRegistered(vcHash, msg.sender); // 이벤트 발생
    }
// VC 등록 확인
    function isVCRegistered(bytes32 vcHash) external view returns (bool) {
        return registeredVCs[vcHash];
    }
// VC가 사용 되었는지 확인
    function isVCUsed(bytes32 vcHash) external view returns (bool) {
        return usedVCs[vcHash];
    }
// VC 사용 처리(결제 완료 시 호출)
    function markVCUsed(bytes32 vcHash) external {
        require(!usedVCs[vcHash], "VC already used");
        require(registeredVCs[vcHash], "VC not registered");
        usedVCs[vcHash] = true;
        emit VCUsed(vcHash, msg.sender);
    }
}
