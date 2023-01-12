var nftContract = artifacts.require("ParibuNFT");
var tokenContract = artifacts.require("CVGToken");
var dummyContract = artifacts.require("DummyToken");
var cinemaContract = artifacts.require("Cinema");
var userContract = artifacts.require("User");

module.exports = async function (deployer) {
    // deployment steps
    // Stage deploying A before B
    await deployer.deploy(nftContract);
    await deployer.deploy(tokenContract);
    await deployer.deploy(dummyContract);
    await deployer.deploy(cinemaContract, tokenContract.address);
    await deployer.deploy(userContract, tokenContract.address, dummyContract.address, cinemaContract.address);
};