const { subtask } = require("hardhat/config");
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require("hardhat/builtin-tasks/task-names");

subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
  const solcConfig = hre.config.solc;
  if (solcConfig && solcConfig.compilerPath) {
    return {
      compilerPath: solcConfig.compilerPath,
      isSolcJs: true,
      version: solcConfig.version,
      longVersion: solcConfig.version,
    };
  }
  return runSuper(args);
});
