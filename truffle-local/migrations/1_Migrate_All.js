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
    await deployer.deploy(userContract, nftContract.address, tokenContract.address, dummyContract.address, cinemaContract.address);
    // await deployer.deploy(userContract, "0xD7e24C9a22BF6133c80c12365CEF57eE34e34574", dummyContract.address, "0x9423bd020a04A290814211A3830B2E02D3496ca4");
};