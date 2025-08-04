const { ethers } = require("hardhat");

async function main() {
  const VCRegistry = await ethers.getContractFactory("VCRegistry");

  const [_, cardCompany] = await ethers.getSigners(); // Account #1 사용 (index 1)

  const vcRegistry = await VCRegistry.deploy(cardCompany.address);
  await vcRegistry.waitForDeployment();

  console.log("✅ VCRegistry deployed to:", await vcRegistry.getAddress());
  console.log("🔐 카드사 주소:", cardCompany.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
