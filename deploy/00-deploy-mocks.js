const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");
const { Contract } = require("ethers");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      log: true, //this true means that we will get additional info like transaction, name of mock, where it is deploying, gas etc...
      from: deployer,
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("Mocks Deployed!");
    log("----------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
