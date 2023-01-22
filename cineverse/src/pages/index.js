import { useState, useEffect, useContext } from 'react';
import styles from "../styles/Home.module.css"

import { MyContext } from './_app';
import { USER_CONTRACT_ADDRESS } from 'config';

import { Widget, Button, Notification, useNotification, Input } from "@web3uikit/core";

export default function Home() {
  const {
    connection,
    TOKEN_URI,
    nftContract,
    tokenContract,
    cinemaContract,
    userContract,
    USDCContract } = useContext(MyContext);

  // User state variables
  const [hasNFT, setHasNFT] = useState(false);
  const [userBalance, setUserBalance] = useState(0.00);
  const [userRank, setUserRank] = useState(null);
  const [seenMovieCount, setSeenMovieCount] = useState(0);
  const [refundableAmount, setRefundableAmount] = useState(0.00);
  const [refundRequest, setRefundRequest] = useState(0);

  // Notifications
  const dispatch = useNotification();
  const handleNewTransaction = (message) => {
    dispatch({
      type: 'success',
      message: `${message}`,
      title: 'New Notification',
      position: 'topL',
    });
  };
  const handleRejectedransaction = (message) => {
    dispatch({
      type: 'error',
      message: message,
      title: 'New Notification',
      position: 'topL',
    });
  };

  // Functions
  async function mintParibuNFT() {
    try {
      const id = await nftContract.mintNFT(connection.address, TOKEN_URI);
      await id.wait();
      setHasNFT(true);
      handleNewTransaction("Transaction sent successfully: " + id.hash);
    }
    catch {
      console.log("Transaction not approved");
    }
  }

  async function deposit10() {
    try {
      const approved = await USDCContract.approve(USER_CONTRACT_ADDRESS, 10 * 1e6);
      const deposited = await userContract.mint10CGV();
      await deposited.wait();
      await getUser();
      handleNewTransaction("Transaction sent: " + deposited.hash);
    } catch {
      handleRejectedransaction("Something went wrong");
    }
  }

  async function deposit20() {
    try {
      const approved = await USDCContract.approve(USER_CONTRACT_ADDRESS, 20 * 1e6);
      const deposited = await userContract.mint20CGV();
      await deposited.wait();
      await getUser();
      handleNewTransaction("Transaction sent: " + deposited.hash);
    } catch {
      handleRejectedransaction("Something went wrong");
    }
  }

  async function deposit30() {
    try {
      const approved = await USDCContract.approve(USER_CONTRACT_ADDRESS, 30 * 1e6);
      const deposited = await userContract.mint30CGV();
      await deposited.wait();
      await getUser();
      handleNewTransaction("Transaction sent: " + deposited.hash);
    } catch {
      handleRejectedransaction("Something went wrong");
    }
  }


  async function refund() {
    try {
      const approved = await tokenContract.approve(USER_CONTRACT_ADDRESS, refundRequest * 1e6)
      const refunded = await userContract.refund(refundRequest * 1e6);
      await refunded.wait();
      handleNewTransaction("Transaction successful: " + refunded.hash);
      await getUser();
    }
    catch {
      handleRejectedransaction("Transaction rejected by user");
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

  // const nftGate = await alchemy.nft.verifyNftOwnership(connection.address, NFT_CONTRACT_ADDRESS); // Devnet
  useEffect(() => {
    const checkNFTandGetUser = async () => {
      console.log(hasNFT);
      const nftGate = await nftContract._hasNFT(connection.address);
      setHasNFT(nftGate);
      console.log(hasNFT);
      if (nftGate) {
        await getUser();
      }
    }
    if (connection.address) {
      checkNFTandGetUser();
    }
  }, [connection.address, hasNFT]);



  return (
    <>
      <div className={styles.container}>
        <div>
          {!hasNFT && (
            <div className={styles.contentDiv}>
              <h2>Become a Member and start earning!</h2>
              <Button text={(connection.address) ? "Mint Paribu NFT to become member!" : "Connect yout wallet first!"}
                disabled={hasNFT}
                onClick={() => mintParibuNFT()}
                theme='moneyPrimary'
              />
            </div>
          )}
          {hasNFT &&
            <div className={styles.contentDiv}>
              <h2>Your Stats</h2>
              <section style={{ display: 'flex', gap: '10px' }}>
                <Widget className={styles.infoWidget} style={{ backgroundColor: 'transparent' }} info={(userBalance / 1e6).toString()} title="CGV Balance" />
                <Widget className={styles.infoWidget} style={{ backgroundColor: 'transparent' }} info={seenMovieCount.toString()} title="Seen Movie Count" />
                <Widget className={styles.infoWidget} style={{ backgroundColor: 'transparent' }} info={(userRank == 0) ? "Novice" : (userRank == 1) ? "Casual" : (userRank == 2) ? "Movie Expert" : ""} title="User Rank" />
              </section>
            </div>
          }
          <div>
            <h2>Get CGV Tokens and enjoy discounts</h2>
            {/* <img src={d100}></img> */}
            <div style={{ display: 'inline-block', padding: '5px 5px 5px 0px' }}>
              <Button
                disabled={!hasNFT}
                text={"Purchase 10 CGV"}
                size="regular"
                isFullWidth={false}
                theme={'moneyPrimary'}
                style={{ padding: "1em", paddingTop: "1em", paddingBottom: "1em" }}
                onClick={() => deposit10()}
              />
            </div>
            <div style={{ display: 'inline-block', padding: '5px 5px 5px 0px' }}>
              <Button
                disabled={!hasNFT}
                text={"Purchase 20 CGV"}
                size="regular"
                isFullWidth={false}
                theme={'moneyPrimary'}
                style={{ padding: "1em", paddingTop: "1em", paddingBottom: "1em" }}
                onClick={() => deposit20()}
              />
            </div>
            <div style={{ display: 'inline-block', padding: '5px 5px 5px 0px' }}>
              <Button
                disabled={!hasNFT}
                text={"Purchase 30 CGV"}
                size="regular"
                isFullWidth={false}
                theme={'moneyPrimary'}
                style={{ padding: "1em", paddingTop: "1em", paddingBottom: "1em" }}
                onClick={() => deposit30()}
              />
            </div>
          </div>
          {hasNFT &&
            <div>
              <Widget
                className={styles.refundWidget}
                info={`Max: ${(refundableAmount / 1e6).toString()} Tokens`}
                title='Refund'
                style={{
                  display: 'grid',
                  backgroundColor: "transparent",
                  border: 'none',
                  alignItems: 'center', justifyContent: 'center'
                }} >
                <Input
                  style={{ display: 'grid', marginTop: '15px', marginBottom: '15px', borderRadius: '10px', borderColor: 'cornflowerblue' }}
                  label="Amount"
                  type="number"
                  validation={{
                    max: refundableAmount,
                    min: 0
                  }}
                  onChange={(e) => setRefundRequest(e.target.value)}
                />
                <Button style={{ display: 'inline-flex' }} text='Refund' theme='colored' color='red' onClick={() => refund()}></Button>
              </Widget>
            </div>
          }
        </div>
      </div>
    </>
  )
}
