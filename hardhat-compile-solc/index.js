const path = require("path");
const { subtask } = require("hardhat/config");
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require("hardhat/builtin-tasks/task-names");

function useLocalSolc() {
  subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD).setAction(
    async (args, hre, runSuper) => {
      if (args.solcVersion === "0.8.18") {
        const compilerPath = path.resolve(__dirname, "../node_modules/solc/soljson.js");
        return {
          compilerPath,
          isSolcJs: true,
          version: "0.8.18",
          longVersion: "0.8.18",
        };
      }
      return runSuper(args);
    }
  );
}

useLocalSolc();

module.exports = useLocalSolc;
