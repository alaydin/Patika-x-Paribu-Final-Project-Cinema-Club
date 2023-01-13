import { useState, useEffect } from 'react';

import { Network, Alchemy } from "alchemy-sdk";
import useConnection from "../Web3-hooks/useConnection";
import useContract from "../Web3-hooks/useContract";
import { TabList, Tab, Widget, Tag, Table, Form, Button, Information, Notification, useNotification, Input, Select } from "@web3uikit/core";
import Cinema from './Cinema';
import d100 from "../assets/100_v6.png";
import d200 from "../assets/200_v6.png";
import d300 from "../assets/300_v6.png";


// import USDCABI from "../ABIs/USDC.json";
// import nftJSON from "../../smartcontracts/artifacts/contracts/1_ParibuNFT.sol/ParibuNFT.json";
// import tokenJSON from "../../smartcontracts/artifacts/contracts/2_CVGToken.sol/CVGToken.json";
// import cinemaJSON from "../../smartcontracts/artifacts/contracts/3_Cinema.sol/Cinema.json";
// import userJSON from "../../smartcontracts/artifacts/contracts/4_User.sol/User.json";

import nftJSON from "../../truffle/build/contracts/ParibuNFT.json";
import tokenJSON from "../../truffle/build/contracts/CVGToken.json";
import cinemaJSON from "../../truffle/build/contracts/Cinema.json";
import userJSON from "../../truffle/build/contracts/User.json";
import fiatJSON from "../../truffle/build/contracts/DummyToken.json"; // Truffle env, comment when devnet

import { API_KEY, TOKEN_URI, NFT_CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS, CINEMA_CONTRACT_ADDRESS, USER_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "../config"
const nftABI = nftJSON.abi;
const tokenABI = tokenJSON.abi;
const cinemaABI = cinemaJSON.abi;
const userABI = userJSON.abi;
const USDCABI = fiatJSON.abi; // Truffle env, comment when devnet

// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: API_KEY, // Replace with your Alchemy API Key.
  network: Network.ETH_GOERLI, // Replace with your network.
};
const alchemy = new Alchemy(settings);

export default function Home() {
  const connection = useConnection();

  // const dispatch = useNotification();

  // Initiate contracts
  const nftContract = useContract(NFT_CONTRACT_ADDRESS, nftABI);
  const tokenContract = useContract(TOKEN_CONTRACT_ADDRESS, tokenABI);
  const cinemaContract = useContract(CINEMA_CONTRACT_ADDRESS, cinemaABI);
  const userContract = useContract(USER_CONTRACT_ADDRESS, userABI);
  const USDCContract = useContract(USDC_CONTRACT_ADDRESS, USDCABI);

  // User state variables
  const [hasNFT, setHasNFT] = useState(false);
  const [userBalance, setUserBalance] = useState(0.00);
  const [userRank, setUserRank] = useState(null);
  const [seenMovieCount, setSeenMovieCount] = useState(0);
  const [refundableAmount, setRefundableAmount] = useState(0.00);
  const [refundRequest, setRefundRequest] = useState(0);

  // Notifications
  // const handleNewTransaction = () => {
  //   dispatch({
  //     type: 'success',
  //     message: 'Transaction sent',
  //     title: 'New Notification',
  //     icon,
  //     position: position || 'topR',
  //   });
  // };
  // const handleRejectedransaction = () => {
  //   dispatch({
  //     type: 'error',
  //     message: 'Transaction rejected',
  //     title: 'New Notification',
  //     icon,
  //     position: position || 'topR',
  //   });
  // };


  // Functions
  async function mintParibuNFT() {
    try {
      const id = await nftContract.mintNFT(connection.address, TOKEN_URI);
      await getUser();
    }
    catch {
      console.log("Transaction not approved");
    }
  }

  async function deposit10() {
    try {
      const approved = await USDCContract.approve(USER_CONTRACT_ADDRESS, 10 * 1e6).then(
        async (success) => {
          const deposited = await userContract.mint10CVG();
          await deposited.wait();
          getUser();
          // handleNewTransaction();
        },
        (reject) => {
          // handleRejectedransaction();
        }
      )
    }
    catch {
      // handleRejectedransaction();
    }
  }
  async function deposit20() {
    try {
      const approved = await USDCContract.approve(USER_CONTRACT_ADDRESS, 20 * 1e6).then(
        async (success) => {
          const deposited = await userContract.mint20CVG();
          await deposited.wait();
          getUser();
          // handleNewTransaction();
        },
        (reject) => {
          // handleRejectedransaction();
        }
      )
    }
    catch {
      // handleRejectedransaction();
    }
  }
  async function deposit30() {
    try {
      const approved = await USDCContract.approve(USER_CONTRACT_ADDRESS, 30 * 1e6).then(
        async (success) => {
          const deposited = await userContract.mint30CVG();
          await deposited.wait();
          getUser();
          // handleNewTransaction();
        },
        (reject) => {
          // handleRejectedransaction();
        }
      )
    }
    catch {
      // handleRejectedransaction();
    }
  }

  async function refund() {
    try {
      const approved = await tokenContract.approve(USER_CONTRACT_ADDRESS, refundRequest * 1e6).then(
        async (success) => {
          const refunded = await userContract.refund(refundRequest * 1e6);
          await refunded.wait();
          console.log(success);
          getUser();
        },
        (reject) => {
          alert(reject);
        }
      )
    }
    catch {
      alert("Something went wrong for refund process");
    }
  }

  async function getUser() {
    try {
      console.log("getting user information");
      const user = await userContract.getUser(connection.address);

      setUserRank(user.userRank);

      setSeenMovieCount(user.seenMovieCount);

      setRefundableAmount(user.inActiveAmount);

      setUserBalance(await tokenContract.balanceOf(connection.address));
    } catch {
      alert("Cannot get user information");
    }
  }

  useEffect(() => {
    async function checkNFT() {
      // const nftGate = await alchemy.nft.verifyNftOwnership(connection.address, NFT_CONTRACT_ADDRESS); // Devnet

      const nftGate = await nftContract._hasNFT(connection.address);
      setHasNFT(nftGate);
    }
    if (connection.address) {
      checkNFT().then(async (success) => {
        await getUser();
      },
        (reject) => {
          alert(reject);
        })
    }
  }, [connection.address, hasNFT]);

  // useEffect(() => {
  //   async function getCinemas() {
  //     console.log(cinemaContract);
  //     const tempCinemas = await cinemaContract.getTheatres();
  //     console.log(tempCinemas);
  //   }
  //   getCinemas();
  // }, [])

  return (
    <>
      <div style={{ marginTop: '15px', marginBottom: '15px' }}>
        <Button id='connectButton' text={(connection.address === undefined || connection.address === "") ? "Connect Wallet" : `${connection.address.slice(0, 5)}...${connection.address.slice(-4)}`} theme="colored" color="blue" onClick={connection.connect}></Button>
      </div>
      <div style={{ justifyItems: 'center' }}>
        <TabList defaultActiveKey={1} tabStyle="bulbUnion">
          <Tab tabKey={1} tabName="User">
            <div className='tabContent'>
              {!hasNFT && (
                <div>
                  <h2>Become a Member and start earning</h2>
                  <Button text={(connection.address) ? "Mint Paribu NFT to become member!" : "Connect yout wallet first!"}
                    disabled={hasNFT}
                    onClick={() => mintParibuNFT()}
                    theme='moneyPrimary'
                  />
                </div>
              )}
              {hasNFT &&
                <div>
                  <h2>Your Stats</h2>
                  <section style={{ display: 'flex', gap: '10px', padding: '10px 10px 10px 0px' }}>
                    <Widget info={(userBalance / 1e6).toString()} title="CVG Balance" />
                    <Widget info={seenMovieCount.toString()} title="Seen Movie Count" />
                    <Widget info={(userRank == 0) ? "Novice" : (userRank == 1) ? "Casual" : (userRank == 2) ? "Movie Expert" : ""} title="User Rank" />
                  </section>
                </div>
              }
              <div style={{}}>
                <h2 style={{ alignSelf: 'center' }}>Get CVG Tokens and enjoy discounts</h2>
                {/* <img src={d100}></img> */}
                <div style={{ display: 'inline-block', padding: '5px 5px 5px 0px' }}>
                  <Button
                    disabled={!hasNFT}
                    text={"Purchase 10 CVG Token"}
                    size="regular"
                    isFullWidth={false}
                    theme={'moneyPrimary'}
                    onClick={() => deposit10()}
                  />
                </div>
                <div style={{ display: 'inline-block', padding: '5px 5px 5px 0px' }}>
                  <Button
                    disabled={!hasNFT}
                    text={"Purchase 20 CVG Token"}
                    size="regular"
                    isFullWidth={false}
                    theme={'moneyPrimary'}
                    onClick={() => deposit20()}
                  />
                </div>
                <div style={{ display: 'inline-block', padding: '5px 5px 5px 0px' }}>
                  <Button
                    disabled={!hasNFT}
                    text={"Purchase 30 CVG Token"}
                    size="regular"
                    isFullWidth={false}
                    theme={'moneyPrimary'}
                    onClick={() => deposit30()}
                  />
                </div>
              </div>
              {hasNFT && // Change it to "hasNFT"
                <div>
                  <h2 style={{ alignSelf: 'center' }}>Refund your purchases</h2>
                  <Widget info={`${(refundableAmount / 1e6).toString()} Tokens`} title='Refund' style={{ display: 'inline-block' }} >
                    {/* <div style={{ display: 'inline-grid' }}> */}
                    <Input
                      label="Amount"
                      type="number"
                      validation={{
                        max: refundableAmount,
                        min: 0
                      }}
                      onChange={(e) => setRefundRequest(e.target.value)}
                      style={{ marginTop: '15px', marginBottom: '15px', minBlockSize: '30px', borderRadius: '10px' }}
                    />
                    <Button text='Refund' theme='colored' color='red' onClick={() => refund()}></Button>
                  </Widget>
                </div>
              }
            </div>
          </Tab>
          <Tab tabKey={2} tabName="Cinemas">
            {/* <Cinema></Cinema> */}
          </Tab>
          <Tab tabKey={3} tabName="Management"></Tab>
        </TabList>
      </div>
    </>
  )
}
