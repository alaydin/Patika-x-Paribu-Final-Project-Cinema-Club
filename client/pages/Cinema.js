import React from 'react'
import { useState, useEffect } from 'react';
import useConnection from '../Web3-hooks/useConnection';
import useContract from '../Web3-hooks/useContract';
import { Select } from '@web3uikit/core';
import cinemaJSON from "../../truffle/build/contracts/Cinema.json";
import CINEMA_CONTRACT_ADDRESS from "../config";

const cinemaABI = cinemaJSON.abi;

function Cinema() {
    // Connection
    const connection = useConnection();

    // Contract
    const cinemaContract = useContract(CINEMA_CONTRACT_ADDRESS, cinemaABI);

    // Cinema state variables
    const [cinemas, setCinemas] = useState([]);
    const [cities, setCities] = useState([]);
    const [city, setCity] = useState();
    const [ticketPrice, setTicketPrice] = useState(0.00);

    // Functions
    async function getCinemas() {
        const tx = cinemaContract.getTheatres();
        await tx.wait();
        if (tx) {
            console.log(tx);
        }
    }

    useEffect(() => {
        getCinemas();
    }, [city])


    return (
        <>
            <Select
                customize={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #00D1AE',
                    borderRadius: '24px',
                    color: '#0B72C4'
                }}
                height="40px"
                isSearch
                label=""
                menuCustomize={{
                    backgroundColor: '#FFFFFF',
                    color: '#041836'
                }}
                name="demo"
                onBlurTraditional={function noRefCheck() { }}
                onChange={function noRefCheck() { }}
                onChangeTraditional={function noRefCheck() { }}
                options={cities.map(() => [{
                    id: 'discord',
                    label: 'Discord',
                    prefix: ""
                }])
                }
                placeholder="Something big name"
                tryBeta
                width="16em"
            />
            <Select
                customize={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #00D1AE',
                    borderRadius: '24px',
                    color: '#0B72C4'
                }}
                height="40px"
                isSearch
                label=""
                menuCustomize={{
                    backgroundColor: '#FFFFFF',
                    color: '#041836'
                }}
                name="demo"
                onBlurTraditional={function noRefCheck() { }}
                onChange={function noRefCheck() { }}
                onChangeTraditional={function noRefCheck() { }}
                options={cinemas.map(() => [{
                    id: 'discord',
                    label: 'Discord',
                    prefix: ""
                }])
                }
                placeholder="Something big name"
                tryBeta
                width="16em"
            />
        </>
    )
}

export default Cinema