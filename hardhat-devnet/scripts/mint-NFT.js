require("dotenv").config()
const API_URL = process.env.API_URL;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(API_URL)

// Contract ABI
const contract = require("../artifacts/contracts/ParibuNFT.sol/ParibuNFT.json")
// console.log(JSON.stringify(contract.abi))

// Contract Address
const CONTRACT_ADDRESS = "0x8c8a1632dabdb6fd08526420aa121b714ff2f7ef";

const nftContract = new web3.eth.Contract(contract.abi, CONTRACT_ADDRESS);

async function mintNFT(tokenURI) {
    const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY);

    const tx = {
        "from": PUBLIC_KEY,
        "to": CONTRACT_ADDRESS,
        "nonce": nonce,
        "gas": 500000,
        "data": nftContract.methods.mintNFT(PUBLIC_KEY, tokenURI).encodeABI()
    }

    const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);

    signPromise.then((signedTx) => {
        web3.eth.sendSignedTransaction(signedTx.rawTransaction, (error, hash) => {
            if (!error) {
                console.log(
                    "The hash of your transaction is: ",
                    hash,
                    "\nCheck Alchemy's Mempool to view the status of your transaction!"
                )
            } else {
                console.log(
                    "Something went wrong when submitting your transaction:",
                    error
                )
            }
        })
    }).catch((error) => {
        console.log("Promise failed: ", error);
    })
}
mintNFT("ipfs://Qmb9wTF8wAyPXireN95UMReCozw6ZNAWKWSvwSs8yA1hQq")