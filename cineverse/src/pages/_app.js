import React from 'react';
export const MyContext = React.createContext();
import "../styles/globals.css";

// import '@/styles/globals.css'
import MyNavbar from './components/Navbar'
import useConnection from "../../Web3-hooks/useConnection"
import useContract from 'Web3-hooks/useContract';
import { Button, useNotification, NotificationProvider } from '@web3uikit/core';

import nftJSON from "../../../truffle/build/contracts/ParibuNFT.json";
import tokenJSON from "../../../truffle/build/contracts/CVGToken.json";
import cinemaJSON from "../../../truffle/build/contracts/Cinema.json";
import userJSON from "../../../truffle/build/contracts/User.json";
import fiatJSON from "../../../truffle/build/contracts/DummyToken.json"; // Truffle env, comment when devnet

// import USDCABI from "../ABIs/USDC.json";
// import nftJSON from "../../smartcontracts/artifacts/contracts/1_ParibuNFT.sol/ParibuNFT.json";
// import tokenJSON from "../../smartcontracts/artifacts/contracts/2_CVGToken.sol/CVGToken.json";
// import cinemaJSON from "../../smartcontracts/artifacts/contracts/3_Cinema.sol/Cinema.json";
// import userJSON from "../../smartcontracts/artifacts/contracts/4_User.sol/User.json";

import { API_KEY, TOKEN_URI, NFT_CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS, CINEMA_CONTRACT_ADDRESS, USER_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "../../config"
const nftABI = nftJSON.abi;
const tokenABI = tokenJSON.abi;
const cinemaABI = cinemaJSON.abi;
const userABI = userJSON.abi;
const USDCABI = fiatJSON.abi; // Truffle env, comment when devnet

export default function App({ Component, pageProps }) {

  const connection = useConnection();

  const nftContract = useContract(NFT_CONTRACT_ADDRESS, nftABI);
  const tokenContract = useContract(TOKEN_CONTRACT_ADDRESS, tokenABI);
  const cinemaContract = useContract(CINEMA_CONTRACT_ADDRESS, cinemaABI);
  const userContract = useContract(USER_CONTRACT_ADDRESS, userABI);
  const USDCContract = useContract(USDC_CONTRACT_ADDRESS, USDCABI);

  return (
    <NotificationProvider>
      <MyContext.Provider value={{ connection, TOKEN_URI, nftContract, tokenContract, cinemaContract, userContract, USDCContract }}>
        <MyNavbar></MyNavbar>
        <div>
          <Button id='connectButton'
            text={(connection.address === undefined || connection.address === "") ? "Connect Wallet" : `${connection.address.slice(0, 5)}...${connection.address.slice(-4)}`}
            theme="colored"
            color="blue"
            onClick={connection.connect}></Button>
        </div>
        <Component {...pageProps} />
      </MyContext.Provider>
    </NotificationProvider>
  )
}

