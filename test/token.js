const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NaturverseToken", function () {
  it("should assign the initial supply to the deployer", async function () {
    const [deployer] = await ethers.getSigners();
    const NaturverseToken = await ethers.getContractFactory("NaturverseToken");
    const token = await NaturverseToken.deploy(ethers.parseEther("1000"));
    await token.waitForDeployment();

    const deployerBalance = await token.balanceOf(deployer.address);
    expect(deployerBalance).to.equal(ethers.parseEther("1000"));
  });
});
