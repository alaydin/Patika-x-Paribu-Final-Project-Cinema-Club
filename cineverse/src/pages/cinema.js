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
    const [cities, setCities] = useState();
    const [names, setNames] = useState();
    const [selectedCity, setSelectedCity] = useState();
    const [selectedName, setSelectedName] = useState();
    const [theatres, setTheatres] = useState([]);
    const [saloons, setSaloons] = useState([]);
    const [tickets, setTickets] = useState(1);

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

    async function getTotalPrice(id) {
        try {
            if (connection.address && nftContract._hasNFT(connection.address)) {
                const price = await cinemaContract.getDiscountedTotalPrice(id, amount);
                return price / 1e6;
            }
            const price = await cinemaContract.getTotalPrice(id, amount);
            return price / 1e6;
        } catch (error) {
            handleRejectedransaction("Something went wrong while getting ticket prices");
        }
    }

    async function buyTicket() { }

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
                    theatres.map((item) => {
                        return (
                            <div className={styles.box} key={item.id}>
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
                                    onChange={(e) => { }}
                                    style={{ marginTop: '15px', marginBottom: '15px', borderRadius: '10px', display: 'inline-grid' }}
                                />
                                <Input
                                    id='saloonInput'
                                    label="Saloon ID"
                                    type="number"
                                    validation={{
                                        numberMin: 0,
                                        required: true,
                                    }}
                                    onChange={(e) => { }}
                                    style={{ marginTop: '15px', marginBottom: '15px', borderRadius: '10px', display: 'inline-grid' }}
                                />
                                <Button
                                    text='Add Movie Theatre'
                                    size="regular"
                                    disabled={connection.address.length == ""}
                                    isFullWidth={false}
                                    theme={'moneyPrimary'}
                                    style={{ padding: "1em", paddingTop: "1em", paddingBottom: "1em", marginTop: "1em", display: "inline-block" }}
                                    onClick={() => buyTicket()}
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