require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    compilers: [{
      version: "0.8.18",
      settings: {},
    }],
  },
  paths: {
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};
