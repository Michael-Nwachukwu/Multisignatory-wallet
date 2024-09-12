import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";
  
describe("Multisig", function () {

    // Function to deploy the ERC20 token that will be used for deposits and withdrawals
    async function deployERC20Token() {
        
        const deployToken = await hre.ethers.getContractFactory("Web3CXI");
        // This line actually deploys the token with the deploy() function
        const token = await deployToken.deploy();

        // Returns the deployed token
        return { token };

    }
    
    async function deployMultisigContract() {
    
        // Contracts are deployed using the first signer/account by default
        const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await hre.ethers.getSigners();

        const signers = [addr1, addr2, addr3, addr4, addr5];

        const noOfValidSigners = signers.length;
    
        const MultiSigContract = await hre.ethers.getContractFactory("Multisig");
        const multisig = await MultiSigContract.deploy(3, signers);
    
        return { multisig, owner, noOfValidSigners, signers, addr6 };

    }
  
    describe("Deployment", function () {
  
        it("Should return right amount of quorum", async function () {
            const { multisig } = await loadFixture(deployMultisigContract);
    
            expect(await multisig.quorum()).to.equal(3);
        });
    
        it("Should return right amount of valid signers", async function () {
            const { multisig, noOfValidSigners } = await loadFixture(
                deployMultisigContract
            );
    
            expect(await multisig.noOfValidSigners()).to.equal(
                noOfValidSigners + 1
            );
        });

    });

    describe("Valid Signers", function () {
  
        it("Should return true for valid signers", async function () {
            const { multisig, signers, owner, addr6 } = await loadFixture(deployMultisigContract);

            expect(await multisig.isValidSigner(owner)).to.be.true;
            expect(await multisig.isValidSigner(signers[0])).to.be.true;
            expect(await multisig.isValidSigner(addr6)).to.be.false;
        });

    });
  
    describe("Transfers", function () {

        describe("Validations", function () {

            it("Should revert with custom error UserNotSigner", async function () {
                const { multisig, signers, owner, addr6 } = await loadFixture(deployMultisigContract);

                const { token } = await loadFixture(deployERC20Token);

                const amount = ethers.parseUnits("100", 18);
        
                await expect(multisig.connect(addr6).transfer(amount, signers[1], token)).to.be.revertedWithCustomError(multisig, "UserNotSigner");
            });

            it("Should revert with custom error ZeroValueNotAllowed", async function () {
                
                const { multisig, signers } = await loadFixture(deployMultisigContract);

                const { token } = await loadFixture(deployERC20Token);

                const amount = 0;
        
                await expect(multisig.connect(signers[2]).transfer(amount, signers[1], token)).to.be.revertedWithCustomError(multisig, "ZeroValueNotAllowed");
            });

            it("Should revert with custom error AddressZeroDetected (tokenAddress)", async function () {
                const { multisig, signers } = await loadFixture(deployMultisigContract);

                const amount = ethers.parseUnits("100", 18);
                const tokenAddress = ethers.ZeroAddress;
        
                await expect(multisig.connect(signers[2]).transfer(amount, signers[1], tokenAddress)).to.be.revertedWithCustomError(multisig, "AddressZeroDetected");
            });

            it("Should revert with custom error AddressZeroDetected (recipient)", async function () {
                const { multisig, signers } = await loadFixture(deployMultisigContract);

                const { token } = await loadFixture(deployERC20Token);

                const amount = ethers.parseUnits("100", 18);
        
                await expect(multisig.connect(signers[2]).transfer(amount, ethers.ZeroAddress, token)).to.be.revertedWithCustomError(multisig, "AddressZeroDetected");
            });

            it("Should revert with custom error InsufficientBalance", async function () {

                const { multisig, signers } = await loadFixture(deployMultisigContract);

                const { token } = await loadFixture(deployERC20Token);

                const amount = ethers.parseUnits("100", 18);
        
                await expect(multisig.transfer(amount, signers[1], token)).to.be.revertedWithCustomError(multisig, "InsufficientBalance");

            });
            
        });

        describe("Signers", function () {

            it("Should mark signer as true", async function () {
                const { multisig, signers } = await loadFixture(deployMultisigContract);
                const { token } = await loadFixture(deployERC20Token);
            
                const amountForContract = ethers.parseUnits("100", 18);
                await token.transfer(multisig, amountForContract);
            
                const amountToTransfer = ethers.parseUnits("100", 18);
                await multisig.connect(signers[2]).transfer(amountToTransfer, signers[1].address, token);
            
                expect(await multisig.hasSigned(signers[2].address, 1)).to.be.true;
    
            });

            it("Should create a new transaction", async function () {
                const { multisig, signers } = await loadFixture(deployMultisigContract);
                const { token } = await loadFixture(deployERC20Token);
                
                const amount = ethers.parseUnits("100", 18);
                await token.transfer(multisig, amount);
                
                await multisig.connect(signers[0]).transfer(amount, signers[1].address, token.target);
                
                const tx = await multisig.transactions(1);
            
                expect(tx.id).to.equal(1);
                expect(tx.amount).to.equal(amount);
                expect(tx.recipient).to.equal(signers[1].address);
                expect(tx.sender).to.equal(signers[0].address);
                expect(tx.isCompleted).to.be.false;
                expect(tx.noOfApprovsals).to.equal(1);
                expect(tx.tokenAddress).to.equal(token.target);
            });
            
        });

    });


    describe("ApproveTx", function () {

        describe("Validations", function () {

            it("Should revert with invalid tx id", async function () {

                const { multisig } = await loadFixture(deployMultisigContract);
        
                await expect(multisig.approveTx(0)).to.be.revertedWithCustomError(multisig, "InvalidTxId");

            });

            // it("Should revert with custom error InsufficientBalance", async function () {
            //     const { multisig, signers } = await loadFixture(deployMultisigContract);

            //     const { token } = await loadFixture(deployERC20Token);
            
            //     // Fund the contract
            //     await token.transfer(multisig.target, ethers.parseUnits("1000", 18));
            
            //     // Create a transaction first
            //     const tx1 = await (multisig.connect(signers[3]).transfer(ethers.parseUnits("800", 18), signers[1], token));

            //     await tx1.wait();

            //     const tx2 = await (multisig.connect(signers[0]).transfer(ethers.parseUnits("500", 18), signers[1], token));

            //     await tx2.wait();

            //     console.log( await multisig.txCount() );
            //     console.log( await token.balanceOf(multisig) );
                

            //     await (multisig.connect(signers[1]).approveTx(2));
            //     await (multisig.connect(signers[2]).approveTx(2));
            
            //     // Try to approve the transaction
            //     await expect(multisig.approveTx(1))
            //         .to.be.revertedWithCustomError(multisig, "InsufficientBalance");
            // });

            it("Should revert with custom error TransactionCompleted", async function () {
                const { multisig, signers, owner } = await loadFixture(deployMultisigContract);
                const { token } = await loadFixture(deployERC20Token);
            
                // Fund the contract
                await token.transfer(multisig.target, ethers.parseUnits("1000", 18));

                // check balance 
                const recipientBalance = await token.balanceOf(signers[1]);
            
                // Create a transaction
                await multisig.connect(signers[0]).transfer(ethers.parseUnits("100", 18), signers[1].address, token.target);

                await multisig.connect(owner).approveTx(1);
                await multisig.connect(signers[1]).approveTx(1);
            
                // Now try to approve it again
                await expect(multisig.connect(signers[2]).approveTx(1))
                    .to.be.revertedWithCustomError(multisig, "TransactionCompleted");
                    
            });
            
        });

    });


    describe("UpdateQuorum", function () {

        describe("Validations", function () {

            it("Should revert with custom error UserNotSigner", async function () {
                const { multisig, signers, addr6 } = await loadFixture(deployMultisigContract);

                const amount = ethers.parseUnits("100", 18);
        
                await expect(multisig.connect(addr6).updateQuorum(5)).to.be.revertedWithCustomError(multisig, "UserNotSigner");
            });

            it("Should revert with custom error ZeroValueNotAllowed", async function () {
                
                const { multisig, signers } = await loadFixture(deployMultisigContract);
        
                await expect(multisig.connect(signers[2]).updateQuorum(1)).to.be.revertedWithCustomError(multisig, "QuorumTooSmall");
            });

            it("Should revert with custom error QuorumExceedsSigners", async function () {
                
                const { multisig, signers } = await loadFixture(deployMultisigContract);
        
                await expect(multisig.connect(signers[2]).updateQuorum(8)).to.be.revertedWithCustomError(multisig, "QuorumExceedsSigners");
            });

            it("Should create a new updateQuorms transaction", async function () {
                const { multisig, signers } = await loadFixture(deployMultisigContract);
                
                await multisig.connect(signers[0]).updateQuorum(4);
                
                const updateTx = await multisig.quorumUpdates(1);
            
                expect(updateTx.id).to.equal(1);
                expect(updateTx.newQuorum).to.equal(4);
                expect(updateTx.isCompleted).to.be.false;
                expect(updateTx.noOfApprovals).to.equal(1);

            });
            
        });

    });



    describe("ApproveUpdateQuorum", function () {

        describe("Validations", function () {

            it("Should revert with custom error UserNotSigner", async function () {
                const { multisig, signers, addr6 } = await loadFixture(deployMultisigContract);
        
                await multisig.connect(signers[1]).updateQuorum(5);

                await expect(multisig.connect(addr6).approveUpdateQuorum(5)).to.be.revertedWithCustomError(multisig, "UserNotSigner");
            });

            it("Should revert with custom error InvalidTxId", async function () {
                
                const { multisig, signers } = await loadFixture(deployMultisigContract);
        
                await expect(multisig.connect(signers[2]).approveUpdateQuorum(0)).to.be.revertedWithCustomError(multisig, "InvalidTxId");
            });

            it("Should revert with custom error TransactionCompleted", async function () {
                const { multisig, signers, owner } = await loadFixture(deployMultisigContract);
            
                // Create a transaction
                await multisig.connect(signers[0]).updateQuorum(4);

                await multisig.connect(owner).approveUpdateQuorum(1);
                await multisig.connect(signers[1]).approveUpdateQuorum(1);
            
                // Now try to approve it again
                await expect(multisig.connect(signers[2]).approveUpdateQuorum(1))
                    .to.be.revertedWithCustomError(multisig, "TransactionCompleted");
                    
            });

            it("Should revert with custom error CantSignTwice", async function () {
                const { multisig, signers, owner } = await loadFixture(deployMultisigContract);
            
                // Create a transaction
                await multisig.connect(signers[0]).updateQuorum(4);

                await multisig.connect(signers[1]).approveUpdateQuorum(1);
            
                // Now try to approve it again
                await expect(multisig.connect(signers[1]).approveUpdateQuorum(1))
                    .to.be.revertedWithCustomError(multisig, "CantSignTwice");
                    
            });

            it("Should return true for user hasSigned", async function () {
                const { multisig, signers, owner } = await loadFixture(deployMultisigContract);
            
                // Create a transaction
                await multisig.connect(signers[0]).updateQuorum(4);

                await multisig.connect(signers[1]).approveUpdateQuorum(1);
                    
                expect(await multisig.connect(signers[1]).hasSigned(signers[1], 1))
                    .to.be.true;
                    
            });

            it("Should return isCompleted for approved update TX", async function () {
                const { multisig, signers, owner } = await loadFixture(deployMultisigContract);
            
                // Create a transaction
                await multisig.connect(signers[0]).updateQuorum(4);

                await multisig.connect(signers[1]).approveUpdateQuorum(1);

                await multisig.connect(signers[2]).approveUpdateQuorum(1);

                expect((await multisig.quorumUpdates(1)).isCompleted)
                    .to.be.true;
                    
            });
            
        });

    });



});
  