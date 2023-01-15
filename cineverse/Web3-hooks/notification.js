import React from 'react'
import { useNotification } from '@web3uikit/core';

const notification = (message) => {

    // Notifications
    const dispatch = useNotification();
    const handleNewTransaction = () => {
        dispatch({
            type: 'success',
            message: `${message}`,
            title: 'New Notification',
            position: 'topL',
        });
    };
    const handleRejectedransaction = () => {
        dispatch({
            type: 'error',
            message: `${message}`,
            title: 'New Notification',
            position: 'topL',
        });
    };

    return { handleNewTransaction, handleRejectedransaction };
}

export default notification