// const fs = require("fs")
// const dotenv = require("dotenv")
const { ethers } = require("hardhat");

async function main() {
    const ParibuNFT = await ethers.getContractFactory("ParibuNFT");
    const CVGToken = await ethers.getContractFactory("CVGToken");
    const Cinema = await ethers.getContractFactory("Cinema");
    const User = await ethers.getContractFactory("User");
    
    // Start deployment, returning a promise that resolves to a contract object
    const paribuNFT = await ParibuNFT.deploy();
    await paribuNFT.deployed();
    console.log(`Contract deployed to address: https://goerli.etherscan.io/address/${paribuNFT.address}`)

    const cvgToken = await CVGToken.deploy();
    await cvgToken.deployed();
    console.log(`Contract deployed to address: https://goerli.etherscan.io/address/${cvgToken.address}`)
    

    const cinema = await Cinema.deploy(cvgToken.address);
    await cinema.deployed();
    console.log(`Contract deployed to address: https://goerli.etherscan.io/address/${cinema.address}`)
    
    const user = await User.deploy(cvgToken.address, cinema.address);
    await user.deployed();
    console.log(`Contract deployed to address: https://goerli.etherscan.io/address/${user.address}`)
    
}
main().then(() => {
    process.exit(0);
}).catch((error) => {
    console.log(error);
    process.exit(1);
})