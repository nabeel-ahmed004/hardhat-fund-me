const { getNamedAccounts, ethers, deployments } = require("hardhat");

async function main() {
  const { depolyer } = await getNamedAccounts();
  const fundMeDeployment = await deployments.get("FundMe", depolyer);
  console.log("Deploying contract...");
  const fundMe = await ethers.getContractAt(
    fundMeDeployment.abi,
    fundMeDeployment.address
  );
  const TransactionResponse = await fundMe.fund({
    value: ethers.parseEther("0.05"),
  });
  await TransactionResponse.wait(1);
  console.log("Deployed and funded contract!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
