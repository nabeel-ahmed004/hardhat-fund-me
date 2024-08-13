const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      //this is the describe for whole FundMe contract
      let fundMe, deployer, mockV3Aggregator;

      //ethers.utils.parseEther("1") DOES NOT WORK!!!!!!!!
      const sendValue = ethers.parseEther("0.05"); //this '1' means 1 ETH //this function is used to store 1000000000000000000 (1 ETH) into sendValue variable

      beforeEach(async function () {
        //1st way //both ways do the same thing
        /*const accounts = ethers.getSigners(); //this function is going to return whatever is in the account portion of our network //e.g. in sepolia, we have 'accounts: [PRIVATE_KEY]'
    //for hardhat, we will get a list of ten fake accounts
    const accountZero = accounts[0]; //this index contains the address of deployer*/

        //2nd way
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]); //this will run all of our deploy scripts with the tag "all" //can use multiple tags

        /*FundMe = await ethers.getContract("FundMe", deployer); //this getContract function gets the most recent deployment of a given contract
    //whenever we call a function with FundMe, it will be from the 'deployer' account, that is why we are giving deployer as a parameter
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);*/

        const fundMeDeployment = await deployments.get("FundMe", deployer);
        fundMe = await ethers.getContractAt(
          fundMeDeployment.abi,
          fundMeDeployment.address
        );

        const mockV3AggregatorDeployment = await deployments.get(
          "MockV3Aggregator"
        );
        mockV3Aggregator = await ethers.getContractAt(
          mockV3AggregatorDeployment.abi,
          mockV3AggregatorDeployment.address
        );
      });

      //this and the describes that are below this one are for the functions of FundMe contract
      describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
          const response = await fundMe.getPriceFeed(); //get the value of priceFeed after deploying the contract
          assert.equal(mockV3Aggregator.target, response);
        });
      });

      describe("fund", async function () {
        it("Fails if you don't send enough Eth!", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!" //this error and the one in the specific function of the contract should be the same
          );
        });

        it("Updated the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });

        it("Adds funder to funders array", async function () {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunders(0);
          assert.equal(funder, deployer);
        });
      });
      describe("Withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });

        it("Withdraw ETH from a single funder", async function () {
          const beforeWithdrawingFundMeBalance =
            await ethers.provider.getBalance(fundMe.target);
          const beforeWithdrawingDeployerBalance =
            await ethers.provider.getBalance(deployer);

          const TransactionResponse = await fundMe.withdraw();
          const TransactionReceipt = await TransactionResponse.wait(1);

          const { gasUsed, gasPrice } = TransactionReceipt; //extracting gasUsed & gasPrice objects from transactionReceipt object
          const gasCost = gasUsed * gasPrice;

          const afterWithdrawingFundMeBalance =
            await ethers.provider.getBalance(fundMe.target);
          const afterWithdrawingDeployerBalance =
            await ethers.provider.getBalance(deployer);

          assert.equal(afterWithdrawingFundMeBalance, 0);
          assert.equal(
            (
              beforeWithdrawingDeployerBalance + beforeWithdrawingFundMeBalance
            ).toString(),
            (afterWithdrawingDeployerBalance + gasCost).toString()
          );
        });
        it("Allows us to withdraw with multiple funders", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 0; i < 6; i++) {
            const fundMeConnectedAccounts = await fundMe.connect(accounts[i]);
            await fundMeConnectedAccounts.fund({ value: sendValue }); //assert.equal was false beacuse of missing 'await' on this line
          }

          const beforeWithdrawingFundMeBalance =
            await ethers.provider.getBalance(fundMe.target);
          const beforeWithdrawingDeployerBalance =
            await ethers.provider.getBalance(deployer);

          const TransactionResponse = await fundMe.withdraw();
          const TransactionReceipt = await TransactionResponse.wait(1);

          const { gasUsed, gasPrice } = TransactionReceipt; //extracting gasUsed & gasPrice objects from transactionReceipt object
          const gasCost = gasUsed * gasPrice;

          const afterWithdrawingFundMeBalance =
            await ethers.provider.getBalance(fundMe.target);
          const afterWithdrawingDeployerBalance =
            await ethers.provider.getBalance(deployer);

          assert.equal(afterWithdrawingFundMeBalance, 0);
          assert.equal(
            (
              beforeWithdrawingFundMeBalance + beforeWithdrawingDeployerBalance
            ).toString(),
            (afterWithdrawingDeployerBalance + gasCost).toString()
          );

          assert.equal(
            (
              beforeWithdrawingDeployerBalance + beforeWithdrawingFundMeBalance
            ).toString(),
            (afterWithdrawingDeployerBalance + gasCost).toString()
          );

          //make sure that funders are reset properly
          await expect(fundMe.getFunders(0)).to.be.reverted;

          for (let i = 0; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("Only allows the owner to withdraw", async function () {
          const address = await ethers.getSigners();
          const attacker = address[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(attackerConnectedContract.withdraw()).to.be
            .reverted; /*With(
        "FundMe__NotOwner"
      );*/
        });

        it("Cheaper withdraw", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 0; i < 6; i++) {
            const fundMeConnectedAccounts = await fundMe.connect(accounts[i]);
            await fundMeConnectedAccounts.fund({ value: sendValue }); //assert.equal was false beacuse of missing 'await' on this line
          }

          const beforeWithdrawingFundMeBalance =
            await ethers.provider.getBalance(fundMe.target);
          const beforeWithdrawingDeployerBalance =
            await ethers.provider.getBalance(deployer);

          const TransactionResponse = await fundMe.cheaperWithdraw();
          const TransactionReceipt = await TransactionResponse.wait(1);

          const { gasUsed, gasPrice } = TransactionReceipt; //extracting gasUsed & gasPrice objects from transactionReceipt object
          const gasCost = gasUsed * gasPrice;

          const afterWithdrawingFundMeBalance =
            await ethers.provider.getBalance(fundMe.target);
          const afterWithdrawingDeployerBalance =
            await ethers.provider.getBalance(deployer);

          assert.equal(afterWithdrawingFundMeBalance, 0);
          assert.equal(
            (
              beforeWithdrawingFundMeBalance + beforeWithdrawingDeployerBalance
            ).toString(),
            (afterWithdrawingDeployerBalance + gasCost).toString()
          );

          assert.equal(
            (
              beforeWithdrawingDeployerBalance + beforeWithdrawingFundMeBalance
            ).toString(),
            (afterWithdrawingDeployerBalance + gasCost).toString()
          );

          //make sure that funders are reset properly
          await expect(fundMe.getFunders(0)).to.be.reverted;

          for (let i = 0; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
      });
    });
