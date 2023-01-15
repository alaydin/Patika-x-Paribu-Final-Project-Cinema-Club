import { useState, useEffect, useContext } from 'react';
import { MyContext } from './_app';
import { USER_CONTRACT_ADDRESS } from 'config';

import { Button, useNotification } from '@web3uikit/core';

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
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [theatres, setTheatres] = useState();
    const [saloons, setSaloons] = useState([]);

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

    async function getSaloons() { }

    async function getTotalPrice() { }

    async function ticketsSold() { }

    function orderCityList() { }

    function orderTheatreList() { }


    return (
        <div>
            <h2>Get Theatres</h2>
            <Button text='Return Theatres' onClick={() => getTheatres()}></Button>
        </div>
    )
}