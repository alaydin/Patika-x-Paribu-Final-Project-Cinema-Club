import { useState, useEffect, useContext } from 'react';
import { MyContext } from './_app';
import { USER_CONTRACT_ADDRESS } from 'config';
import styles from "../styles/cinema.module.css"

import { Button, useNotification, Table, Input } from '@web3uikit/core';

export default function cinema() {

    const {
        connection,
        TOKEN_URI,
        nftContract,
        tokenContract,
        cinemaContract,
        userContract,
        USDCContract } = useContext(MyContext);

    // State variables
    const [theatres, setTheatres] = useState([]);
    let saloonInput = [];
    let ticketInput = [];

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
    async function getTheatres() {
        try {
            const result = await cinemaContract.getTheatres();
            const theatres = (await Promise.all(result.map(async (theatre, index) => {
                return {
                    id: index,
                    name: theatre.name,
                    location: theatre.location,
                    price: Number(theatre.ticketPriceInCVG) / 1e6,
                    numberOfSaloons: theatre.movieSaloons.length
                }
            })))

            console.log(theatres);
            setTheatres(theatres);
        } catch {
            // handleRejectedransaction("Something went wrong during getting theatres");
        }
    }

    async function getSaloons() { }

    async function getPrice(id, ticketAmount) {
        try {
            if (connection.address && nftContract._hasNFT(connection.address)) {
                const price = await cinemaContract.getDiscountedTotalPrice(id, ticketAmount);
                return price / 1e6;
            }
            const price = await cinemaContract.getTotalPrice(id, ticketAmount);
            return price / 1e6;
        } catch (error) {
            handleRejectedransaction("Something went wrong while getting ticket prices");
        }
    }

    async function buyTicket(tId, sId, ticketAmount) {
        try {
            const price = await getPrice(tId, ticketAmount);
            const approved = await tokenContract.approve(USER_CONTRACT_ADDRESS, price * 1e6);
            await approved.wait();
            console.log(tId, sId, ticketAmount);
            const bought = userContract.ticketBuy(tId, sId, ticketAmount);
            await bought;
            handleNewTransaction(`Transaction successful\n${ticketAmount} tickets has been bought at ${theatres[tId].name}`)
        } catch {
            handleRejectedransaction("Something went wrong during ticket buy process");
        }

    }

    function orderCityList() { }

    function orderTheatreList() { }

    useEffect(() => {
        if (theatres.length <= 0) {
            getTheatres();
        }
    }, []);

    return (
        <>
            <div className={styles.container}>
                {theatres.length > 0 ?
                    theatres.map((item, index) => {
                        return (
                            <div className={styles.box} key={item.id} style={{}}>
                                <p className={styles.name}>{item.name}</p>
                                <p className={styles.location}>{item.location}</p>
                                <p>Ticket Price: {item.price} CVG</p>
                                <p>Total Saloons: {item.numberOfSaloons}</p>
                                <Input
                                    id='ticketsInput'
                                    label="Ticket amount"
                                    type="number"
                                    validation={{
                                        numberMin: 1,
                                        required: true
                                    }}
                                    placeholder='1'
                                    onChange={(e) => { ticketInput[index] = e.target.value; console.log(ticketInput[index]) }}
                                    style={{ marginTop: '15px', marginBottom: '15px', borderRadius: '10px', display: 'inline-block' }}
                                />
                                <Input
                                    id='saloonInput'
                                    label="Saloon ID"
                                    type="number"
                                    validation={{
                                        numberMin: 0,
                                        numberMax: item.numberOfSaloons - 1,
                                        required: true,
                                    }}
                                    errorMessage='check your inputs!'
                                    onChange={(e) => { saloonInput[index] = e.target.value; console.log(saloonInput[index]) }}
                                    style={{ marginTop: '15px', marginBottom: '15px', borderRadius: '10px', display: 'inline-block' }}
                                />
                                <Button
                                    text='Purchase'
                                    size="regular"
                                    disabled={!connection.address.length}
                                    isFullWidth={true}
                                    theme={'moneyPrimary'}
                                    style={{ padding: "1em", paddingTop: "0.5em", paddingBottom: "0.5em", marginTop: "1em" }}
                                    onClick={() => { console.log("sending: " + index, saloonInput[index], ticketInput[index]); buyTicket(index, saloonInput[index], ticketInput[index]) }}
                                />
                            </div>
                        )
                    }) :
                    <div>There are no movie theatres to show yet</div>
                }
            </div>
        </>
    )
}