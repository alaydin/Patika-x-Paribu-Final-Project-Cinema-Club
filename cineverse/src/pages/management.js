import { useState, useEffect, useContext, use } from 'react';
import { MyContext } from './_app';
import { useNotification, Input, Button } from '@web3uikit/core';

import styles from "../styles/management.module.css"

export default function management() {

    const {
        connection,
        TOKEN_URI,
        nftContract,
        tokenContract,
        cinemaContract,
        userContract,
        USDCContract } = useContext(MyContext);

    // State variables
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [price, setPrice] = useState(0.00);

    const [theatres, setTheatres] = useState([]);
    const [theatreId, setTheatreId] = useState(0);
    const [numberOfSeats, setnumberOfSeats] = useState(0);

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
            console.log("getting theatres");
            const theatres = await cinemaContract.getTheatres();
            setTheatres(theatres);
            console.log(theatres);
        } catch (error) {
            handleRejectedransaction(error);
        }
    }


    async function addTheatre() {
        try {
            const added = await cinemaContract.addTheatre(name, location, price);
            await added.wait();
            handleNewTransaction("Transaction successful: " + added.hash);
            //getTheatres()
        } catch (error) {
            handleRejectedransaction(error);
        }
    }


    return (
        <div>
            <h2>Add Theatre and Saloon</h2>
            <Input
                label="Name"
                type="text"
                validation={{
                    required: true
                }}
                onChange={(e) => setName(e.target.value)}
                style={{ marginRight: '10px', borderRadius: '10px', display: 'inline-block' }}
            />
            <Input
                label="Location"
                type="text"
                validation={{
                    required: true
                }}
                onChange={(e) => setLocation(e.target.value)}
                style={{ marginRight: '10px', borderRadius: '10px', display: 'inline-block' }}
            />
            <Input
                label="Price"
                type="number"
                validation={{
                    numberMin: 0,
                    required: true
                }}
                onChange={(e) => setPrice(e.target.value)}
                style={{ marginRight: '10px', borderRadius: '10px', display: 'inline-block' }}
            />
            <Button
                text='Add Movie Theatre'
                size="regular"
                isFullWidth={false}
                theme={'moneyPrimary'}
                style={{ padding: "1em", paddingTop: "1em", paddingBottom: "1em", display: 'inline-block' }}
                onClick={() => addTheatre()}
            />
        </div>
    )
}