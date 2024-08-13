const { ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe, deployer;
      const sendValue = ethers.parseEther("0.05");
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        const fundMeDeployment = await deployments.get("FundMe", deployer);
        fundMe = await ethers.getContractAt(
          fundMeDeployment.abi,
          fundMeDeployment.address
        );
      });
      it("allows people to fund and withdraw", async function () {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await ethers.provider.getBalance(fundMe.target);
        assert.equal(endingBalance.toString(), 0);
      });
    });
