import React, { useEffect, useState } from 'react';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connectToWallet, stakeMATIC, WithdrawFn, reinvest } from './utils/web3API';
import Spinner from 'react-bootstrap/Spinner';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
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
  }, []);

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
