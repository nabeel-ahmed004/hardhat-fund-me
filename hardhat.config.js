require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-solhint");
require("hardhat-deploy");
//require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat", //defaultNetwork is "hardhat"
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/7982f71bcdcd40a4a98119108d558cdc",
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 1,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      //accounts: provided by hardhat
      chainId: 31337,
    },
  },

  /*sourcify: { //used for verifying manually
    // Disabled by default
    // Doesn't need an API key
    enabled: true,
  },*/

  //solidity: "0.8.8",
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.8.7" }], //just an example of how to add multiple versions of solidity compilers
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY, //we need an API key from etherscan for verifying our smart contract
  },

  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    //coinmarketcap: COINMARKETCAP_API_KEY,
    token: "MATIC",
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
};
