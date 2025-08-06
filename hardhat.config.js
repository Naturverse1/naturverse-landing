require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("./hardhat-compile-solc");

module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: "https://rpc2.sepolia.org",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

