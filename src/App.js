import React, { useEffect, useState } from "react";
import headerback from './assets/header.png';
import logo from './assets/PolygonLogo.png';
import contactIcon from './assets/ClipboardText.png';
import './App.css';
import { connectToWallet, web3_contact_balance, web3_total_deposit, web3_user_deposit_count, web3_user_total_withdraw, web3_user_total_deposit, web3_user_referral_bonus, web3_available_balance, stakeMATIC, reinvest, WithdrawFn, web3_referred_users } from './utils/web3API';

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [contact_balance, setContactBalance] = useState(0.000);
  const [total_deposit, setTotalDeposit] = useState(0);
  const [user_deposit_count, setUserDepositCount] = useState(0);
  const [user_total_deposit, setUserTotalDeposit] = useState(0.000);
  const [user_total_withdraw, setUserTotalWithdraw] = useState(0.000);
  const [user_referral_bonus, setUserReferralBonus] = useState(0.000);
  const [referred_user, setReferredUsers] = useState(0.000);
  const [amount_plan1, setAmountPlan1] = useState(0.000);
  const [amount_plan2, setAmountPlan2] = useState(0.000);
  const [referral_address, setReferralAddress] = useState("");
  const [reinvest_show, setReinvestShow] = useState(false);
  const [available_balance, setAvailableBalance] = useState(0);

  useEffect(() => {
    if (walletAddress) {
      getContactBalance();
      getTotalDeposit();
      getUserDepositCount();
      getUserTotalDeposit();
      getUserTotalWithdraw();
      getUserReferralBonus();
      getReferredUsers();
      getUserAvailableBalance();
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress) {
      walletConnect();
    }
  }, []);

  const walletConnect = async () => {
    const res = await connectToWallet();
    setWalletAddress(res);
  };

  const getContactBalance = async () => {
    const res = await web3_contact_balance();
    setContactBalance(parseFloat(res).toFixed(4));
  };

  const getTotalDeposit = async () => {
    const res = await web3_total_deposit();
    console.log(res);
    setTotalDeposit(parseFloat(res).toFixed(4));
  };

  const getUserDepositCount = async () => {
    const res = await web3_user_deposit_count();
    setUserDepositCount(res);
  };

  const getUserTotalDeposit = async () => {
    const res = await web3_user_total_deposit();
    setUserTotalDeposit(parseFloat(res).toFixed(4));
  };

  const getUserTotalWithdraw = async () => {
    const res = await web3_user_total_withdraw();
    setUserTotalWithdraw(parseFloat(res).toFixed(4));
  };

  const getUserReferralBonus = async () => {
    const res = await web3_user_referral_bonus();
    setUserReferralBonus(res);
  };

  const getReferredUsers = async () => {
    const res = await web3_referred_users();
    setReferredUsers(res);
  };

  const getUserAvailableBalance = async () => {
    const res = await web3_available_balance();
    setAvailableBalance(parseFloat(res).toFixed(4));
  };

  const formattedAddress = () => {
    if (walletAddress) {
      return `${walletAddress.slice(0, 5)}...${walletAddress.slice(-5)}`;
    }
  };

  const callStakePlan1 = async () => {
    var ref_add = document.getElementById('wallet_address').value;
    const res = await stakeMATIC(ref_add, amount_plan1, 0);
    return res;
  };

  const callStakePlan2 = async () => {
    var ref_add = document.getElementById('wallet_address').value;
    const res = await stakeMATIC(ref_add, amount_plan2, 1);
    return res;
  };

  const Reinvest_show = () => {
    setReinvestShow(!reinvest_show);
    console.log(reinvest_show);
  };

  const Reinvest = async (plan) => {
    const res = await reinvest(plan);
    return res;
  };

  const Withdraw = async () => {
    const res = await WithdrawFn();
    return res;
  };

  const PasteWalletAddress = async () => {
    const text = await navigator.clipboard.readText();
    console.log(text);
    document.getElementById('wallet_address').value = text;
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-logo" style={{ backgroundImage: `url(${headerback})`, backgroundSize: 'cover' }}>
          <div>
            <p className='maintitle primary-title m-5 mt-3 mb-0 text-start'>
              Extra Matic
            </p>
            <p className='primary-title m-5 mt-0 text-start'>
              by Polygon
            </p>
          </div>
          <div>
            <button className='connect-wallet m-5' onClick={() => { walletConnect() }}>
              <span>
                {walletAddress ? formattedAddress() : "Connect to Wallet"}
              </span>
            </button>
          </div>
        </div>
        <div>
          <p className='header-content primary-title header-content'>
            Extra Matic is an ROI smart contract platform powered by the Polygon Matic network, aiming to provide long term sustainable income
          </p>
        </div>
      </header>
      <main>
        <div className='mainpart-one'>
          <button className='contact-btn'>
            Audit
          </button>
          <button className='contact-btn'>
            Contract
          </button>
          <button className='contact-btn'>
            Telegram
          </button>
        </div>
        <div className='container-fluid custom-p-5'>
          <div className='row custom-p-5 d-flex justify-content-between'>
            <div className='col-xl-3 col-lg-4 col-md-12 col-sm-12 py-3'>
              <div className='row'>
                <div className='col-xl-12 col-lg-12 col-md-6 col-sm-12'>
                  <div className='plan-subpart mb-2'>
                    <p className='secondary-title p-5' id='contract-balance'>
                      {contact_balance}
                    </p>
                    <p className='secondary-subtitle p-2'>
                      Contract Balance
                    </p>
                  </div>
                </div>
                <div className='col-xl-12 col-lg-12 col-md-6 col-sm-12'>
                  <div className='plan-subpart'>
                    <p className='secondary-title p-5' id='total-deposit'>
                      {total_deposit}
                    </p>
                    <p className='secondary-subtitle p-2'>
                      Total Deposit
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-xl-3 col-lg-4 col-md-6 col-sm-12 py-3'>
              <div className='primary-header d-flex justify-content-center'>
                <p className='primary-title'>
                  Plan 1
                </p>
              </div>
              <div className='primary-body p-5 pb-1'>
                <div className='plan-deadline rounded-pill'>
                  <p className='py-3 primary-title'>
                    17% daily<br /> for 8 days
                  </p>
                </div>
                <p className='plan-totalvalue'>
                  total 136%
                </p>
                <div>
                  <input type="text" pattern="[0-9]*" className='plan-valueinput' onChange={(e) => { setAmountPlan1(e.target.value) }} />
                </div>
                <div>
                  <button className='deposit-btn primary-title' onClick={() => callStakePlan1()} disabled={!amount_plan1}>
                    Deposit
                  </button>
                </div>
                <div className='secondary-content pt-4 pb-3'>
                  Minimum deposit 0.1 Matic
                </div>
              </div>
            </div>
            <div className='col-xl-3 col-lg-4 col-md-6 col-sm-12 py-3'>
              <div className='primary-header d-flex justify-content-center'>
                <p className='primary-title'>
                  Plan 2
                </p>
              </div>
              <div className='primary-body p-5 pb-1'>
                <div className='plan-deadline rounded-pill'>
                  <p className='py-3 primary-title'>
                    7% daily<br /> for 60 days
                  </p>
                </div>
                <p className='plan-totalvalue'>
                  total 420%
                </p>
                <input type="text" pattern="[0-9]*" className='plan-valueinput' onChange={(e) => { setAmountPlan2(e.target.value) }} />
                <div>
                  <button className='deposit-btn primary-title' onClick={() => callStakePlan2()} disabled={!amount_plan2}>
                    Deposit
                  </button>
                </div>
                <div className='secondary-content pt-4 pb-3'>
                  Minimum deposit 0.1 Matic
                </div>
              </div>
            </div>
            <div className='col-xl-3 col-lg-4 col-md-6 col-sm-12 py-3'>
              <div className='row'>
                <div className='col-xl-12 col-lg-12 col-md-6 col-sm-12'>
                  <div className='plan-subpart mb-2'>
                    <p className='secondary-title p-5' id='available-balance'>
                      {available_balance}
                    </p>
                    <p className='secondary-subtitle p-2'>
                      Available Balance
                    </p>
                  </div>
                </div>
                <div className='col-xl-12 col-lg-12 col-md-6 col-sm-12'>
                  <div className='plan-subpart'>
                    <p className='secondary-title p-5' id='total-withdraw'>
                      {user_total_withdraw}
                    </p>
                    <p className='secondary-subtitle p-2'>
                      Total Withdraw
                    </p>
                  </div>
                </div>
                <div className='col-xl-12 col-lg-12 col-md-6 col-sm-12'>
                  <div className='plan-subpart'>
                    <p className='secondary-title p-5' id='referral-bonus'>
                      {user_referral_bonus}
                    </p>
                    <p className='secondary-subtitle p-2'>
                      Referral Bonus
                    </p>
                  </div>
                </div>
                <div className='col-xl-12 col-lg-12 col-md-6 col-sm-12'>
                  <div className='plan-subpart'>
                    <p className='secondary-title p-5' id='referred-users'>
                      {referred_user}
                    </p>
                    <p className='secondary-subtitle p-2'>
                      Referred Users
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='container-fluid custom-p-5'>
          <div className='row custom-p-5 d-flex justify-content-between'>
            <div className='col-xl-6 col-lg-6 col-md-12 col-sm-12 py-3'>
              <div className='primary-header d-flex justify-content-center'>
                <p className='primary-title'>
                  Reinvest
                </p>
              </div>
              <div className='primary-body p-5 pb-1'>
                <div className='plan-deadline rounded-pill'>
                  <p className='py-3 primary-title'>
                    Plan 1: 17% daily<br /> for 8 days
                  </p>
                  <button className='reinvest-btn primary-title' onClick={() => Reinvest(0)}>
                    Reinvest
                  </button>
                </div>
                <div className='plan-deadline rounded-pill'>
                  <p className='py-3 primary-title'>
                    Plan 2: 7% daily<br /> for 60 days
                  </p>
                  <button className='reinvest-btn primary-title' onClick={() => Reinvest(1)}>
                    Reinvest
                  </button>
                </div>
              </div>
            </div>
            <div className='col-xl-6 col-lg-6 col-md-12 col-sm-12 py-3'>
              <div className='primary-header d-flex justify-content-center'>
                <p className='primary-title'>
                  Withdraw
                </p>
              </div>
              <div className='primary-body p-5 pb-1'>
                <button className='withdraw-btn primary-title' onClick={Withdraw}>
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
