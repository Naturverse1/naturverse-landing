require("@nomicfoundation/hardhat-toolbox");
require("hardhat-compile-solc");

const solcPath = require.resolve("solc/soljson.js");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  solc: {
    version: "0.8.18",
    compilerPath: solcPath,
  },
};

