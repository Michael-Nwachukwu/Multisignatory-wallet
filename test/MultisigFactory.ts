import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";
  
describe("Multisig", function () {
    
    async function deployMultiSigFactory() {
    
        const multiSigFactory = await hre.ethers.getContractFactory("MultisigFactory");

        const factory = await multiSigFactory.deploy();
    
        return { factory };

    }
  
    describe("Deployment", function () {
  
        it("Should return right amount of contracts", async function () {

            const { factory } = await loadFixture(deployMultiSigFactory);

            const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await hre.ethers.getSigners();

            const signers = [addr1, addr2, addr3, addr4, addr5];

            await factory.createMultiSigFactory(3, signers);

            const multiSigClones = await factory.getMultiSigClones();
    
            expect(multiSigClones.length).to.equal(1);
        });


        it("Should return right amount of contracts", async function () {

            const { factory } = await loadFixture(deployMultiSigFactory);

            const [addr1, addr2, addr3, addr4, addr5] = await hre.ethers.getSigners();

            const signers1 = [addr1, addr2, addr3];
            const signers2 = [addr4, addr5];

            await factory.createMultiSigFactory(3, signers1);
            await factory.createMultiSigFactory(3, signers2);

            const multiSigClones = await factory.getMultiSigClones();
    
            expect(multiSigClones.length).to.equal(2);

        });

        
    });

});
  