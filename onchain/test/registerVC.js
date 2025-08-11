const { ethers } = require("ethers");
const axios = require("axios");
const fs = require("fs");

async function main() {
  // 📌 1. VC 해시값과 컨트랙트 주소를 API로부터 받아오기
  const hashRes = await axios.get("http://localhost:3001/latest-hash"); // 예시 API
  const contractAddressRes = await axios.get("http://localhost:3001/contract-address"); // 예시 API

  const vcHash = hashRes.data.hash; // { hash: "0x..." } 형태를 기대
  const contractAddress = contractAddressRes.data.address; // { address: "0x..." }

  if (!vcHash || !contractAddress) {
    console.error("❌ 해시 또는 컨트랙트 주소가 비어 있음");
    return;
  }

  // 📌 2. 로컬 Hardhat 네트워크와 연결
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const signer = await provider.getSigner(0);

  // 📌 3. ABI 불러오기
  const abiPath = "artifacts/contracts/VCStorage.sol/VCStorage.json";
  const abi = JSON.parse(fs.readFileSync(abiPath)).abi;

  const contract = new ethers.Contract(contractAddress, abi, signer);

  // 📌 4. VC 해시 등록
  const tx = await contract.addVC(vcHash);
  await tx.wait();

  console.log("✅ VC 해시 등록 완료:", vcHash);
}

main().catch((err) => {
  console.error("❌ 에러:", err);
});