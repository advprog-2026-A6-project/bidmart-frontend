import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import './Wallet.css';

const dummyTransactions = [
  { id: 'TRX-9982', type: 'TOP_UP', amount: 5000000, date: '2026-05-18 14:30', status: 'SUCCESS', availableBalance: 3800000, heldBalance: 1200000, desc: 'Top up via System' },
  { id: 'TRX-9983', type: 'BID_HOLD', amount: 1200000, date: '2026-05-18 15:00', status: 'SUCCESS', ref: 'AUC-102', availableBalance: 3800000, heldBalance: 1200000, desc: 'Hold for auction' },
  { id: 'TRX-9984', type: 'BID_RELEASE', amount: 500000, date: '2026-05-19 09:15', status: 'SUCCESS', ref: 'AUC-098', availableBalance: 5000000, heldBalance: 0, desc: 'Release from auction' },
];

const Wallet = () => {
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="wallet-container container">
        <div className="wallet-header">
          <h1>My Wallet</h1>
          <p>Manage your funds and track your auction transactions securely.</p>
        </div>

        <div className="balance-grid">
          <div className="balance-card primary-card glass-effect">
            <div className="card-icon-wrapper"><WalletIcon size={28}/></div>
            <h3>Available Balance</h3>
            <div className="amount">Rp 3,800,000</div>
            <p>Ready for withdrawal or new bids</p>
          </div>
          <div className="balance-card secondary-card glass-effect">
            <div className="card-icon-wrapper"><Clock size={28}/></div>
            <h3>Held Balance</h3>
            <div className="amount">Rp 1,200,000</div>
            <p>Locked in active auctions</p>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn-action top-up-btn" onClick={() => setShowTopUp(true)}>
            <ArrowDownLeft size={20} /> Top Up Balance
          </button>
          <button className="btn-action withdraw-btn" onClick={() => setShowWithdraw(true)}>
            <ArrowUpRight size={20} /> Withdraw Funds
          </button>
        </div>

        {showTopUp && (
          <div className="modal-overlay">
            <div className="modal-content glass-effect">
              <h3>Top Up Balance</h3>
              <p className="modal-desc">Enter the amount you wish to add to your wallet.</p>
              <input 
                type="number" 
                placeholder="Enter amount (e.g. 100000)" 
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="amount-input"
              />
              <div className="modal-actions">
                <button className="btn-ghost" onClick={() => setShowTopUp(false)}>Cancel</button>
                <button className="btn-primary" onClick={() => {
                  alert(`Simulating payment gateway for Rp ${topUpAmount}...`);
                  setShowTopUp(false);
                }}>Proceed to Payment</button>
              </div>
            </div>
          </div>
        )}

        {showWithdraw && (
          <div className="modal-overlay">
            <div className="modal-content glass-effect">
              <h3>Withdraw Funds</h3>
              <p className="modal-desc">Enter bank details and amount to withdraw.</p>
              <input 
                type="text" 
                placeholder="Bank Account (e.g. BCA 12345678)" 
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
                className="amount-input"
                style={{marginBottom: '15px'}}
              />
              <input 
                type="number" 
                placeholder="Enter amount (e.g. 100000)" 
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="amount-input"
              />
              <div className="modal-actions">
                <button className="btn-ghost" onClick={() => setShowWithdraw(false)}>Cancel</button>
                <button className="btn-primary" onClick={() => {
                  alert(`Simulating withdrawal of Rp ${withdrawAmount} to ${withdrawAccount}...`);
                  setShowWithdraw(false);
                }}>Withdraw</button>
              </div>
            </div>
          </div>
        )}

        <div className="transaction-history glass-effect">
          <div className="section-title">
            <h2>Transaction History</h2>
            <Link to="/transactions" className="view-all">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="table-responsive">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Description & Ref</th>
                  <th>Amount</th>
                  <th>Balance Snapshot</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dummyTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td className="font-mono">{tx.id}</td>
                    <td>{tx.date}</td>
                    <td>
                      <span className={`badge ${tx.type.toLowerCase()}`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div>{tx.desc}</div>
                      <div className="font-mono" style={{fontSize: '0.75rem', marginTop: '4px', color: 'var(--text-light)'}}>{tx.ref || '-'}</div>
                    </td>
                    <td className={tx.type.includes('HOLD') || tx.type === 'WITHDRAW' ? 'text-red font-bold' : 'text-green font-bold'}>
                      {tx.type.includes('HOLD') || tx.type === 'WITHDRAW' ? '-' : '+'} Rp {tx.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="balance-snapshot" style={{fontSize: '0.85rem'}}>
                      <div>Avail: Rp {tx.availableBalance?.toLocaleString('id-ID') || 0}</div>
                      <div style={{color: 'var(--text-light)'}}>Held: Rp {tx.heldBalance?.toLocaleString('id-ID') || 0}</div>
                    </td>
                    <td>
                      {tx.status === 'SUCCESS' ? 
                        <div className="status-cell text-green"><CheckCircle size={16} /> Success</div> : 
                        <div className="status-cell text-red"><XCircle size={16} /> Failed</div>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wallet;
