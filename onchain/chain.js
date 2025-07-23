const { ethers } = require("hardhat");

async function main() {
  const VCRegistry = await ethers.getContractFactory("VCRegistry");
  const vcRegistry = await VCRegistry.deploy();
  await vcRegistry.waitForDeployment();

  console.log("✅ VCRegistry deployed to:", await vcRegistry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
