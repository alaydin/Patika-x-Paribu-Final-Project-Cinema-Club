import { ethers } from "ethers";
import { useEffect, useState } from "react";

const useConnection = () => {

    const [signer, setSigner] = useState(undefined)
    const [provider, setProvider] = useState("")
    const [address, setAddress] = useState("")
    const [auth, setAuth] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)

    const connect = async () => {
        if (!window.ethereum) {
            alert("metamask is not installed!");
            return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
            setIsConnecting(true);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setSigner(signer);
            setProvider(provider);
            setAddress(address);
            setAuth(true);
            setIsConnecting(false);
        } catch (error) {
            console.log(error);
            setIsConnecting(false);
        }

        provider.on('accountsChanged', (accounts) => {
            // Handle the new accounts, or lack thereof.
            // "accounts" will always be an array, but it can be empty.
            setAddress(window.ethereum.selectedAddress);
        });
        provider.on('chainChanged', (chainId) => {
            // Handle the new chain.
            // Correctly handling chain changes can be complicated.
            // We recommend reloading the page unless you have good reason not to.
            window.location.reload();
        });
        provider.on('disconnect', () => { setAddress(""); console.log(address) });
    }

    return {
        connect,
        signer,
        provider,
        address,
        auth,
        isConnecting
    };
}

export default useConnection;






// function connect() {
//     if (!window.alert) {
//         alert("metamask is not installed!");
//         return;
//     }

//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     provider
//         .send("eth_requestAccounts", [])
//         .then((accounts) => setAccount(accounts[0]))
//         .catch((err) => console.log(err))
// }