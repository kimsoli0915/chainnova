// 스마트 컨트랙트 배포, 트랜젝션 전송, 계정 제어에 사용
const { ethers } = require("hardhat");
// 컴파일된 VCRegistry 컨트랙트 로드
async function main() {
  const VCRegistry = await ethers.getContractFactory("VCRegistry");
// Hardhat 기본 생성 테스트 계정 목록 불러옴
  const [_, cardCompany] = await ethers.getSigners();
// VCRegistry 컨트랙트 배포; 카드사 주소 전달
  const vcRegistry = await VCRegistry.deploy(cardCompany.address);
  await vcRegistry.waitForDeployment();
// 배포 완료 후, 컨트랙트 주소와 카드사 주소 출력
  console.log("✅ VCRegistry deployed to:", await vcRegistry.getAddress());
  console.log("카드사 주소:", cardCompany.address);
}
// 예외 처리
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
