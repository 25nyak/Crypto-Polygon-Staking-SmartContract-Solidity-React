import React, { useEffect, useState } from 'react';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connectToWallet, web3_contact_balance, web3_total_deposit, web3_user_total_deposit, web3_user_total_withdraw, web3_user_referral_bonus, web3_referred_users, web3_available_balance, stakeMATIC, WithdrawFn, reinvest } from './utils/web3API';
import Spinner from 'react-bootstrap/Spinner';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [contact_balance, setContact_balance] = useState('');
  const [total_deposit, setTotal_deposit] = useState('');
  const [user_total_deposit, setUser_total_deposit] = useState('');
  const [user_total_withdraw, setUser_total_withdraw] = useState('');
  const [user_referral_bonus, setUser_referral_bonus] = useState('');
  const [referred_users, setReferred_users] = useState('');
  const [available_balance, setAvailable_balance] = useState('');
  const [amount, setAmount] = useState('');
  const [referral_address, setReferralAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [planId, setPlanId] = useState('');

  useEffect(() => {
    async function fetchData() {
      const walletAddress = await connectToWallet();
      setWalletAddress(walletAddress);
    }
    fetchData();
  }, [walletAddress]);

  const handleStake = async () => {
    setLoading(true);
    const result = await stakeMATIC(referral_address, amount, planId);
    setLoading(false);
    if (result) {
      toast.success("Staked successfully!");
    } else {
      toast.error("Staking failed!");
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    const result = await WithdrawFn();
    setLoading(false);
    if (result) {
      toast.success("Withdrawn successfully!");
    } else {
      toast.error("Withdrawal failed!");
    }
  };

  const handleReinvest = async () => {
    setLoading(true);
    const result = await reinvest(planId);
    setLoading(false);
    if (result) {
      toast.success("Reinvested successfully!");
    } else {
      toast.error("Reinvestment failed!");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Polygon MATIC DApp</h1>
      </header>
      <main>
        <section>
          <h2>Wallet Address: {walletAddress}</h2>
          <button onClick={handleStake} disabled={loading}>Stake MATIC</button>
          <button onClick={handleWithdraw} disabled={loading}>Withdraw</button>
          <button onClick={handleReinvest} disabled={loading}>Reinvest</button>
          {loading && <Spinner animation="border" />}
        </section>
      </main>
      <ToastContainer />
    </div>
  );
}

export default App;
