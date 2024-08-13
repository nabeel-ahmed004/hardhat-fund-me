//1st way of creating and calling a function
/*async function deployFunc(hre) {
  console.log("Hi!");
}
module.exports.default = deployFunc;*/

//2nd way of creating and calling a function
/*module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  //we can also use hre.getNamedAccounts, hre.deployments instead of the above line
};*/

//another version of the 2nd way used above
//instead of the above two lines, we can also write the following line and it also does the same task as above lines

//we can use both of the following ways
//1st way
/*const helperConfig = require("../helper-hardhat-config");
const networkConfig = helperConfig.networkConfig;*/

//2nd way
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  // console.log(`Chain id: ${chainId}`);

  //the following line means get 'ethUsdPriceFeedAddress' address from 'networkConfig' according to the corresponding 'chainId'
  //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  let ethUsdPriceFeedAddress;

  //we do this so that we don't have to change our code
  //if statement is true for localhost and hardhat networks(const developmentChains = ["hardhat", "localhost"];)
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    //else statement is true for other networks
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  const args = [ethUsdPriceFeedAddress];
  //console.log(`Price feed Address: ${ethUsdPriceFeedAddress}`);
  //console.log(`Etherscan API key: ${process.env.ETHERSCAN_API_KEY}`);

  //if the contract does not exist, we deploy a minimal version of it (i.e. a mock) for our local testing
  //when deploying to a localhost or hardhat network, we want to use a mock
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, //put price feed address beacuse the constructor of our FundMe contract takes an address as a parameter
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
    //if number of block confirmations is not specified, wait for 1 block confirmation
    // '||' means 'or'
  });
  log("-----------------------------");

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args); //always write 'await' with this kind of stuff
  }
};

module.exports.tags = ["all", "fundme"];
