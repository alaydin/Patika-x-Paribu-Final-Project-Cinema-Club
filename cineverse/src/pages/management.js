import { useState, useEffect, useContext, use } from 'react';
import { MyContext } from './_app';
import { useNotification, Input, Button, Table, Widget } from '@web3uikit/core';

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

    console.log(cinemaContract);

    // State variables
    const [theatres, setTheatres] = useState([]);
    const [usdc, setUsdc] = useState(0);
    //Adding
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [price, setPrice] = useState(0.00);
    const [theatreId, setTheatreId] = useState(0);
    const [numberOfSeats, setNumberOfSeats] = useState(0);
    //Update
    const [updatedTheatre, setUpdatedTheatre] = useState(0);
    const [updatedPrice, setUpdatedPrice] = useState(0.00);
    //Removing
    const [removeTheatreId, setRemoveTheatreId] = useState(0);
    const [tIdForRemoveSaloon, setTIdForRemoveSaloon] = useState(0);
    const [removeSaloonId, setRemoveSaloonId] = useState(0);
    //Withdraw
    const [usdcReceiver, setUsdcReceiver] = useState();
    const [usdcInput, setUsdcInput] = useState(0);


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
    const handleRejectedTransaction = (message) => {
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
            const result = await cinemaContract.getTheatres();
            await result;
            const theatres = await Promise.all(result.map(async (theatre, index) => {
                return [
                    index,
                    theatre.location,
                    theatre.name,
                    theatre.movieSaloons.length,
                    Number(theatre.ticketPriceInCGV / 1e6),
                    Number(theatre.theatreBalance / 1e6),
                ]
            }));
            setTheatres(theatres);
        } catch {
            handleRejectedTransaction();
        }
    }

    async function addTheatre() {
        try {
            const added = await cinemaContract.addTheatre(name, location, price);
            await added.wait();
            handleNewTransaction("Transaction successful: " + added.hash);
            await getTheatres();
        } catch {
            handleRejectedTransaction("Transaction rejected");
        }
    }

    async function addMovieSaloon() {
        try {
            const added = await cinemaContract.addMovieSaloon(theatreId, numberOfSeats);
            await added.wait();
            handleNewTransaction("Movie Saloon has been added. \nTransaction successful: " + added.hash);
            await getTheatres();
        } catch {
            handleRejectedTransaction("Transaction rejected");
        }
    }

    async function removeTheatre() {
        try {
            const removed = await cinemaContract.removeTheatre(removeTheatreId);
            await removed.wait();
            handleNewTransaction("Movie Theare with ID " + removeTheatreId + " has been removed" + "\nTransaction successful: " + removed.hash);
            await getTheatres();
        } catch {
            handleRejectedTransaction("Transaction rejected");
        }
    }

    async function removeSaloon() {
        try {
            const removed = await cinemaContract.removeSaloon(tIdForRemoveSaloon, removeSaloonId);
            await removed.wait();
            handleNewTransaction("Movie Saloon with ID " + removeSaloonId + " has been removed" + "\nTransaction successful: " + removed.hash);
            await getTheatres();
        } catch {
            handleRejectedTransaction("Transaction rejected");
        }
    }

    async function updatePrice() {
        try {
            // console.log(updatedTheatre, updatedPrice);
            const updated = await cinemaContract.updateTicketPrice(updatedTheatre, updatedPrice);
            await updated.wait();
            handleNewTransaction("Ticket price for the theatre with ID " + updatedTheatre + " has been updated to " + updatedPrice + "\nTransaction hash: " + updated.hash);
            await getTheatres();
        } catch {
            handleRejectedTransaction("Transaction rejected");
        }
    }

    async function withdrawAll() {
        try {
            const withdrew = await cinemaContract.withdrawBalances();
            await withdrew.wait();
            handleNewTransaction("Transaction hash: " + withdrew.hash);
            await getTheatres();
        } catch {
            handleRejectedTransaction("Transaction rejected");
        }
    }

    async function withdrawUSDC() {
        try {
            const withdrew = userContract.withdrawCGV(usdcReceiver, usdcInput);
            await withdrew.wait();
            handleNewTransaction("Transaction sent: " + withdrew.hash);
        } catch {
            handleRejectedTransaction("Transaction rejected");
        }
    }

    async function getFiat() {
        // // try {
        // const getUsdc = userContract.getFiatBalance();
        // await getUsdc;
        // console.log("USDC:" + getUsdc.result);
        // setUsdc(getUsdc.value);
        // // } catch {
        // //     handleRejectedTransaction("Transaction rejected");
        // // }
    }

    useEffect(() => {
        if (theatres.length <= 0) {
            getTheatres();
        }
        // getFiat();
    }, []);


    return (
        <>
            <div className={styles.container}>
                <h2>Add Movie Theatre</h2>
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
                    style={{ padding: "1em", paddingTop: "0.5em", paddingBottom: "0.5em", marginTop: "1em" }}
                    onClick={() => addTheatre()}
                />
            </div>
            <div className={styles.container}>
                <h2>Add Movie Saloon</h2>
                <Input
                    label="Theatre ID"
                    type="number"
                    validation={{
                        numberMin: 0,
                        required: true
                    }}
                    onChange={(e) => setTheatreId(e.target.value)}
                    style={{ marginRight: '10px', borderRadius: '10px', display: 'inline-block' }}
                />
                <Input
                    label="Number of seats"
                    type="number"
                    validation={{
                        numberMin: 0,
                        required: true
                    }}
                    onChange={(e) => setNumberOfSeats(e.target.value)}
                    style={{ marginRight: '10px', borderRadius: '10px', display: 'inline-block' }}
                />
                <Button
                    text='Add Movie Saloon'
                    size="regular"
                    isFullWidth={false}
                    theme={'moneyPrimary'}
                    style={{ padding: "1em", paddingTop: "0.5em", paddingBottom: "0.5em", marginTop: "1em" }}
                    onClick={() => addMovieSaloon()}
                />
            </div>
            {theatres.length > 0 &&
                <div className={styles.container}>
                    <div>
                        <h2>Update Ticket Price</h2>
                        <Input
                            label="Update ID"
                            type="number"
                            validation={{
                                numberMin: 0,
                                required: true
                            }}
                            onChange={(e) => setUpdatedTheatre(e.target.value)}
                            style={{ marginRight: '10px', borderRadius: '10px', display: 'inline-block' }}
                        />
                        <Input
                            label="New Price"
                            type="number"
                            validation={{
                                numberMin: 0,
                                required: true
                            }}
                            onChange={(e) => setUpdatedPrice(e.target.value)}
                            style={{ marginRight: '10px', borderRadius: '10px', display: 'inline-block' }}
                        />
                        <Button
                            text='Update'
                            size="regular"
                            isFullWidth={false}
                            theme={'moneyPrimary'}
                            style={{ padding: "1em", paddingTop: "0.5em", paddingBottom: "0.5em", marginTop: "1em" }}
                            onClick={() => updatePrice()}
                        />
                    </div>
                    <div>
                        <h2>Remove Movie Theatre</h2>
                        <Input
                            label="Remove ID"
                            type="number"
                            validation={{
                                numberMin: 0,
                                required: true
                            }}
                            onChange={(e) => setRemoveTheatreId(e.target.value)}
                            style={{ marginRight: '10px', borderRadius: '10px', display: 'inline-block' }}
                        />
                        <Button
                            text='Remove'
                            size="regular"
                            isFullWidth={false}
                            theme={'colored'}
                            color={'red'}
                            style={{ padding: "1em", paddingTop: "0.5em", paddingBottom: "0.5em", marginTop: "1em" }}
                            onClick={() => removeTheatre()}
                        />
                    </div>
                    <div>
                        <h2>Remove Movie Saloon</h2>
                        <Input
                            label="Theatre ID"
                            type="number"
                            validation={{
                                numberMin: 0,
                                numberMax: theatres.length - 1,
                                required: true
                            }}
                            onChange={(e) => setTIdForRemoveSaloon(e.target.value)}
                            style={{ marginRight: '10px', borderRadius: '10px', display: 'inline-block' }}
                        />
                        <Input
                            label="Saloon ID"
                            type="number"
                            validation={{
                                numberMin: 0,
                                required: true
                            }}
                            onChange={(e) => setRemoveSaloonId(e.target.value)}
                            style={{ marginRight: '10px', borderRadius: '10px', display: 'inline-block' }}
                        />
                        <Button
                            text='Remove'
                            size="regular"
                            isFullWidth={false}
                            theme={'colored'}
                            color={'red'}
                            style={{ padding: "1em", paddingTop: "0.5em", paddingBottom: "0.5em", marginTop: "1em" }}
                            onClick={() => removeSaloon()}
                        />
                    </div>
                    <h2>Movie Theatres</h2>
                    <Table
                        columnsConfig="5fr 5fr 5fr 5fr 5fr 5fr 3fr"
                        data={theatres}
                        header={[
                            <span>ID</span>,
                            <span>Location</span>,
                            <span>Name</span>,
                            <span>Number of Saloons</span>,
                            <span>Price</span>,
                            <span>Balance</span>,
                            <Button
                                text='Withdraw All'
                                size="regular"
                                isFullWidth={false}
                                theme={'moneyPrimary'}
                                style={{}}
                                onClick={() => withdrawAll()}
                            />,
                        ]}
                        isColumnSortable={[
                            true,
                            true,
                            true,
                            true,
                            true,
                            true,
                        ]}
                        customNoDataText="No Cinemas are added yet"
                        onPageNumberChanged={function noRefCheck() { }}
                        onRowClick={function noRefCheck() { }}
                        pageSize={5}
                    />
                </div>
            }
            {/* <div>
                <h2>Withdraw USDC in User Contract</h2>
                <Widget
                    className={styles.refundWidget}
                    info={`${(usdc / 1e6).toString()} USDC`}
                    title='Withdraw'
                    style={{
                        display: 'grid',
                        backgroundColor: "transparent",
                        border: 'none',
                        // alignItems: 'center', justifyContent: 'center'
                    }} >
                    <Input
                        label="Address"
                        type="text"
                        validation={{
                            required: true
                        }}
                        onChange={(e) => setUsdcReceiver(e.target.value)}
                        style={{ marginRight: '10px', borderRadius: '10px' }}
                    />
                    <Input
                        label="Amount"
                        type="number"
                        validation={{
                            numberMin: 0,
                            required: true
                        }}
                        onChange={(e) => setUsdcInput(e.target.value)}
                        style={{ marginRight: '10px', borderRadius: '10px' }}
                    />
                    <Button
                        text='Withdraw'
                        size="regular"
                        isFullWidth={false}
                        theme={'moneyPrimary'}
                        style={{ padding: "1em", paddingTop: "0.5em", paddingBottom: "0.5em", marginTop: "1em" }}
                        onClick={() => withdrawUSDC()}
                    />
                </Widget>

            </div> */}
        </>
    )
}