import Web3 from 'web3';
import contractAbi from '../config/abi.json';
import { toast } from 'react-toastify';

let Contract = require("web3-eth-contract");
Contract.setProvider("https://rpc-mainnet.maticvigil.com");

export const connectToWallet = async () => {
    let web3;
    try {
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        } else if (window.web3) {
            web3 = new Web3(window.web3.currentProvider || "https://rpc-mainnet.maticvigil.com");
        }
        const accounts = await web3.eth.getAccounts();
        return accounts[0];
    } catch (error) {
        return false;
    }
};

export const getWeb3 = async () => {
    let web3;
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
    } else if (window.web3) {
        await window.web3.currentProvider.enable();
        web3 = new Web3(window.web3.currentProvider);
    } else {
        console.log('No web3 instance detected.');
        return false;
    }
    return web3;
};

export const web3_contact_balance = async () => {
    const web3 = await getWeb3();
    if (!web3) {
        console.log("No web3 instance found.");
        return false;
    }
    try {
        let extraMaticContract = new Contract(contractAbi, "0x2a2cf93bc92537a596e7956315ce914186d0242f");
        const res = await extraMaticContract.methods.getSiteInfo().call();
        let contact_balance = web3.utils.fromWei(res['_contractBalance']);
        return contact_balance;
    } catch (e) {
        console.log("Failed to fetch contract balance");
        return false;
    }
};

export const web3_total_deposit = async () => {
    const web3 = await getWeb3();
    if (!web3) {
        toast.error("No web3 instance found.");
        return false;
    }
    try {
        let extraMaticContract = new Contract(contractAbi, "0x2a2cf93bc92537a596e7956315ce914186d0242f");
        const res = await extraMaticContract.methods.getSiteInfo().call();
        let total_deposit = web3.utils.fromWei(res['_totalInvested']);
        return total_deposit;
    } catch (e) {
        return false;
    }
};

export const web3_user_deposit_count = async () => {
    const web3 = await getWeb3();
    if (!web3) {
        console.log("No web3 instance found.");
        return false;
    }
    try {
        let extraMaticContract = new Contract(contractAbi, "0x2a2cf93bc92537a596e7956315ce914186d0242f");
        const accounts = await web3.eth.getAccounts();
        const res = await extraMaticContract.methods.getUserAmountOfDeposits(accounts[0]).call();
        return res;
    } catch (e) {
        return false;
    }
};

export const web3_user_total_deposit = async () => {
    const web3 = await getWeb3();
    if (!web3) {
        console.log("No web3 instance found.");
        return false;
    }
    try {
        let extraMaticContract = new Contract(contractAbi, "0x2a2cf93bc92537a596e7956315ce914186d0242f");
        const accounts = await web3.eth.getAccounts();
        const res = await extraMaticContract.methods.getUserInfo(accounts[0]).call();
        let total_deposit = web3.utils.fromWei(res['totalDeposit']);
        return total_deposit;
    } catch (e) {
        return false;
    }
};

export const web3_user_total_withdraw = async () => {
    const web3 = await getWeb3();
    if (!web3) {
        console.log("No web3 instance found.");
        return false;
    }
    try {
        let extraMaticContract = new Contract(contractAbi, "0x2a2cf93bc92537a596e7956315ce914186d0242f");
        const accounts = await web3.eth.getAccounts();
        const res = await extraMaticContract.methods.getUserInfo(accounts[0]).call();
        let total_withdraw = web3.utils.fromWei(res['totalWithdrawn']);
        return total_withdraw;
    } catch (e) {
        return false;
    }
};

export const web3_user_referral_bonus = async () => {
    const web3 = await getWeb3();
    if (!web3) {
        console.log("No web3 instance found.");
        return false;
    }
    try {
        let extraMaticContract = new Contract(contractAbi, "0x2a2cf93bc92537a596e7956315ce914186d0242f");
        const accounts = await web3.eth.getAccounts();
        const res = await extraMaticContract.methods.getUserReferralTotalBonus(accounts[0]).call();
        let referral_bonus = web3.utils.fromWei(res);
        return referral_bonus;
    } catch (e) {
        return false;
    }
};

export const web3_referred_users = async () => {
    const web3 = await getWeb3();
    if (!web3) {
        console.log("No web3 instance found.");
        return false;
    }
    try {
        let extraMaticContract = new Contract(contractAbi, "0x2a2cf93bc92537a596e7956315ce914186d0242f");
        const accounts = await web3.eth.getAccounts();
        const res = await extraMaticContract.methods.getUserTotalReferrals(accounts[0]).call();
        return res;
    } catch (e) {
        return false;
    }
};

export const web3_available_balance = async () => {
    const web3 = await getWeb3();
    if (!web3) {
        console.log("No web3 instance found.");
        return false;
    }
    try {
        let extraMaticContract = new Contract(contractAbi, "0x2a2cf93bc92537a596e7956315ce914186d0242f");
        const accounts = await web3.eth.getAccounts();
        const res = await extraMaticContract.methods.getUserAvailable(accounts[0]).call();
        let available_balance = web3.utils.fromWei(res);
        return available_balance;
    } catch (e) {
        return false;
    }
};

export const stakeMATIC = async (referral_address, amount, planId) => {
    const web3 = await getWeb3();
    if (!web3) {
        toast.error("No web3 instance found.");
        return false;
    }
    try {
        let connectedAddress = await connectToWallet();
        let extraMaticContract = new Contract(contractAbi, "0x2a2cf93bc92537a596e7956315ce914186d0242f");
        const txCount = await web3.eth.getTransactionCount(connectedAddress);
        let referrer = referral_address || "0x2D19c11f66BE26Ba13333C428aD2050630B8176b";
        const myNewData = await extraMaticContract.methods.invest(referrer, planId).encodeABI();
        let weiPrice = web3.utils.toWei(`${amount}`, 'ether');
        const gas2 = await web3.eth.getGasPrice();
        const transactionParameters = {
            nonce: web3.utils.toHex(txCount),
            gasPrice: web3.utils.toHex(gas2),
            to: "0x2a2cf93bc92537a596e7956315ce914186d0242f",
            from: connectedAddress,
            data: myNewData,
            value: web3.utils.toHex(weiPrice)
        };

        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });

        if (txHash) {
            console.log("Transaction Done Successfully.");
        }
    } catch (e) {
        toast.error(e.message);
        return false;
    }
};

export const reinvest = async (planId) => {
    const web3 = await getWeb3();
    if (!web3) {
        toast.error("No web3 instance found.");
        return false;
    }
    try {
        let connectedAddress = await connectToWallet();
        let extraMaticContract = new Contract(contractAbi, "0x2a2cf93bc92537a596e7956315ce914186d0242f");
        const txCount = await web3.eth.getTransactionCount(connectedAddress);
        const myNewData = await extraMaticContract.methods.reinvest(planId).encodeABI();
        const gas2 = await web3.eth.getGasPrice();
        const transactionParameters = {
            nonce: web3.utils.toHex(txCount),
            gasPrice: web3.utils.toHex(gas2),
            to: "0x2a2cf93bc92537a596e7956315ce914186d0242f",
            from: connectedAddress,
            data: myNewData,
        };

        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });

        if (txHash) {
            console.log("Transaction Done Successfully.");
        }
    } catch (e) {
        console.log(e.message);
        return false;
    }
};

export const WithdrawFn = async () => {
    const web3 = await getWeb3();
    if (!web3) {
        toast.error("No web3 instance found.");
        return false;
    }
    try {
        let connectedAddress = await connectToWallet();
        let extraMaticContract = new Contract(contractAbi, "0x2a2cf93bc92537a596e7956315ce914186d0242f");
        const txCount = await web3.eth.getTransactionCount(connectedAddress);
        const myNewData = await extraMaticContract.methods.withdraw().encodeABI();
        const gas2 = await web3.eth.getGasPrice();
        const transactionParameters = {
            nonce: web3.utils.toHex(txCount),
            gasPrice: web3.utils.toHex(gas2),
            to: "0x2a2cf93bc92537a596e7956315ce914186d0242f",
            from: connectedAddress,
            data: myNewData,
        };

        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });

        if (txHash) {
            toast.success("Transaction Done Successfully.");
        }
    } catch (e) {
        toast.error(e.message);
        return false;
    }
};
