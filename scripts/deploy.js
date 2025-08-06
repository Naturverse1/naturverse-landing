const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const NaturverseToken = await hre.ethers.getContractFactory("NaturverseToken");
  const token = await NaturverseToken.deploy(hre.ethers.parseEther("1000"));
  await token.waitForDeployment();

  console.log("NaturverseToken deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
