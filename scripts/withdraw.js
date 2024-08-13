const { getNamedAccounts, deployments, ethers } = require("hardhat");
async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMeDeployment = await deployments.get("FundMe", deployer);
  const fundMe = await ethers.getContractAt(
    fundMeDeployment.abi,
    fundMeDeployment.address
  );
  console.log("Deploying...");
  const TransactionResponse = await fundMe.withdraw();
  await TransactionResponse.wait(1);
  console.log("Withdrawed the funds back!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
