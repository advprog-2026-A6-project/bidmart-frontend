import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, ArrowRight, Landmark } from 'lucide-react';
import './Wallet.css';

const dummyTransactions = [
  { id: 'TRX-9982', type: 'TOP_UP', amount: 5000000, date: '2026-05-18 14:30', status: 'SUCCESS', availableBalance: 3800000, heldBalance: 1200000, desc: 'Top up via Simulated Bank' },
  { id: 'TRX-9983', type: 'BID_HOLD', amount: 1200000, date: '2026-05-18 15:00', status: 'SUCCESS', ref: 'AUC-102', availableBalance: 3800000, heldBalance: 1200000, desc: 'Hold for auction' },
  { id: 'TRX-9984', type: 'BID_RELEASE', amount: 500000, date: '2026-05-19 09:15', status: 'SUCCESS', ref: 'AUC-098', availableBalance: 5000000, heldBalance: 0, desc: 'Release from auction' },
];

const Wallet = () => {
  const [availableBalance, setAvailableBalance] = useState(3800000);
  const [heldBalance] = useState(1200000);
  const [bankBalance, setBankBalance] = useState(15000000);
  const [bankAccount] = useState('BCA - 8820391827');

  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpStep, setTopUpStep] = useState(1); // 1 = input nominal, 2 = VA created / payment sim
  const [activeTopUp, setActiveTopUp] = useState(null); // { virtualAccount, amount, paymentReference }
  const [simulateVaInput, setSimulateVaInput] = useState('');
  const [simulateAmountInput, setSimulateAmountInput] = useState('');

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('BCA - 8820391827');

  const [transactions, setTransactions] = useState(dummyTransactions);

  const handleInitiateTopUp = () => {
    const amount = parseInt(topUpAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      alert("Masukkan nominal top-up yang valid!");
      return;
    }
    if (amount > bankBalance) {
      alert(`Saldo bank tidak mencukupi!\nSaldo bank saat ini: Rp ${bankBalance.toLocaleString('id-ID')}`);
      return;
    }
    const demoVa = `88201${Math.floor(100 + Math.random() * 900)}`;
    const demoRef = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    const topUpData = {
      virtualAccount: demoVa,
      amount: amount,
      paymentReference: demoRef
    };
    setActiveTopUp(topUpData);
    setSimulateVaInput(demoVa);
    setSimulateAmountInput(String(amount));
    setTopUpStep(2);
  };

  const handleSimulatePayment = () => {
    if (!simulateVaInput || !simulateAmountInput) {
      alert("Lengkapi nomor Virtual Account dan nominal!");
      return;
    }
    const amount = parseInt(simulateAmountInput, 10);
    if (isNaN(amount) || amount <= 0) {
      alert("Masukkan nominal bayar yang valid.");
      return;
    }

    // Deduct from bank balance, add to available balance
    setBankBalance(prev => prev - amount);
    setAvailableBalance(prev => prev + amount);
    
    // Generate new TRX ID
    const newTxId = `TRX-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newTx = {
      id: newTxId,
      type: 'TOP_UP',
      amount: amount,
      date: dateString,
      status: 'SUCCESS',
      availableBalance: availableBalance + amount,
      heldBalance: heldBalance,
      desc: `Top up via VA ${simulateVaInput}`
    };
    
    setTransactions([newTx, ...transactions]);
    setShowTopUp(false);
    setTopUpAmount('');
    setActiveTopUp(null);
    setTopUpStep(1);
    alert("Top Up Berhasil! Dana telah masuk ke dompet Anda.");
  };

  const handleWithdrawSubmit = () => {
    const amount = parseInt(withdrawAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      alert("Masukkan nominal withdraw yang valid.");
      return;
    }
    if (amount > availableBalance) {
      alert(`Simulasi Gagal: Saldo wallet Anda tidak mencukupi!\nSaldo wallet saat ini: Rp ${availableBalance.toLocaleString('id-ID')}`);
      return;
    }
    
    // Deduct from available balance, add back to bank balance if it's connected bank
    setAvailableBalance(prev => prev - amount);
    
    const isSimulatedBank = withdrawAccount.toUpperCase().includes('8820391827') || withdrawAccount.toUpperCase().includes('8820');
    if (isSimulatedBank) {
      setBankBalance(prev => prev + amount);
    }
    
    // Generate new TRX ID
    const newTxId = `TRX-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newTx = {
      id: newTxId,
      type: 'WITHDRAW',
      amount: amount,
      date: dateString,
      status: 'SUCCESS',
      availableBalance: availableBalance - amount,
      heldBalance: heldBalance,
      desc: `Tarik saldo ke ${withdrawAccount}`
    };
    
    setTransactions([newTx, ...transactions]);
    setShowWithdraw(false);
    setWithdrawAmount('');
    alert(`Penarikan Sukses!\nRp ${amount.toLocaleString('id-ID')} telah berhasil ditarik ke Rekening Bank ${withdrawAccount}.`);
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="wallet-container container">
        <div className="wallet-header" style={{ marginBottom: '40px' }}>
          <h1>My Wallet</h1>
          <p>Manage your funds and track your auction transactions securely.</p>
        </div>

        <div className="balance-grid">
          <div className="balance-card primary-card glass-effect">
            <div className="card-icon-wrapper"><WalletIcon size={28}/></div>
            <h3>Available Balance</h3>
            <div className="amount">Rp {availableBalance.toLocaleString('id-ID')}</div>
            <p>Ready for withdrawal or new bids</p>
          </div>
          <div className="balance-card secondary-card glass-effect">
            <div className="card-icon-wrapper"><Clock size={28}/></div>
            <h3>Held Balance</h3>
            <div className="amount">Rp {heldBalance.toLocaleString('id-ID')}</div>
            <p>Locked in active auctions</p>
          </div>
          <div className="balance-card bank-card glass-effect">
            <div className="card-icon-wrapper"><Landmark size={28}/></div>
            <div className="bank-card-badge">CONNECTED BANK</div>
            <h3>Simulated Bank Balance</h3>
            <div className="amount">Rp {bankBalance.toLocaleString('id-ID')}</div>
            <p className="bank-account-no">{bankAccount}</p>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn-action top-up-btn" onClick={() => { setShowTopUp(true); setTopUpStep(1); }}>
            <ArrowDownLeft size={20} /> Top Up Balance
          </button>
          <button className="btn-action withdraw-btn" onClick={() => setShowWithdraw(true)}>
            <ArrowUpRight size={20} /> Withdraw Funds
          </button>
        </div>

        {showTopUp && (
          <div className="modal-overlay">
            <div className="modal-content glass-effect" style={{ maxWidth: '480px' }}>
              <h3>Top Up Balance</h3>
              
              {topUpStep === 1 ? (
                <>
                  <p className="modal-desc">Simulasikan pengisian saldo wallet dengan Virtual Account.</p>
                  <div style={{ marginBottom: '16px', background: '#f1f5f9', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-light)', fontWeight: 500 }}>Sumber Rekening:</div>
                    <div style={{ fontWeight: 600, color: 'var(--tertiary-blue)', marginTop: '2px' }}>{bankAccount}</div>
                    <div style={{ color: 'var(--text-light)', marginTop: '4px' }}>
                      Saldo Bank Tersedia: <strong>Rp {bankBalance.toLocaleString('id-ID')}</strong>
                    </div>
                  </div>
                  <input 
                    type="number" 
                    placeholder="Masukkan nominal (misal 50000)" 
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="amount-input"
                  />
                  <div className="modal-actions">
                    <button className="btn-ghost" onClick={() => setShowTopUp(false)}>Batal</button>
                    <button className="btn-primary" onClick={handleInitiateTopUp}>Buat Virtual Account</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="modal-desc">Virtual Account berhasil diinisiasi! Selesaikan pembayaran melalui simulator di bawah.</p>
                  
                  {/* Virtual Account Info Card */}
                  <div style={{ 
                    marginBottom: '20px', 
                    padding: '16px', 
                    border: '2px dashed #ffc107', 
                    background: '#fffdf0', 
                    borderRadius: '12px',
                    position: 'relative'
                  }}>
                    <span style={{ 
                      position: 'absolute', 
                      top: '12px', 
                      right: '12px', 
                      fontSize: '0.65rem', 
                      fontWeight: 700, 
                      color: '#d97706',
                      background: '#fef3c7',
                      padding: '2px 8px',
                      borderRadius: '50px',
                      border: '1px solid rgba(217, 119, 6, 0.2)'
                    }}>⏳ MENUNGGU BAYAR</span>
                    
                    <div style={{ fontSize: '0.75rem', color: '#856404', fontWeight: 600 }}>NOMOR VIRTUAL ACCOUNT</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-dark)', margin: '4px 0', fontFamily: 'monospace' }}>
                      {activeTopUp?.virtualAccount}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>Nominal:</div>
                        <div style={{ fontWeight: 700, color: '#16a34a' }}>Rp {activeTopUp?.amount.toLocaleString('id-ID')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', textAlign: 'right' }}>Ref ID:</div>
                        <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--text-light)', textAlign: 'right' }}>
                          {activeTopUp?.paymentReference?.substring(0, 15)}...
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bank Simulator Form inside the Modal */}
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginBottom: '20px' }}>
                    <h4 style={{ color: 'var(--tertiary-blue)', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 600 }}>Simulasi Pembayaran Bank</h4>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>Nomor VA</label>
                      <input 
                        type="text" 
                        value={simulateVaInput}
                        onChange={(e) => setSimulateVaInput(e.target.value)}
                        className="amount-input"
                        style={{ fontSize: '1rem', padding: '10px', marginBottom: '0' }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>Nominal Bayar</label>
                      <input 
                        type="number" 
                        value={simulateAmountInput}
                        onChange={(e) => setSimulateAmountInput(e.target.value)}
                        className="amount-input"
                        style={{ fontSize: '1rem', padding: '10px', marginBottom: '0' }}
                      />
                    </div>
                  </div>
                  
                  <div className="modal-actions">
                    <button className="btn-ghost" onClick={() => { setTopUpStep(1); setActiveTopUp(null); }}>Kembali</button>
                    <button className="btn-primary" onClick={handleSimulatePayment}>Bayar VA Sekarang</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {showWithdraw && (
          <div className="modal-overlay">
            <div className="modal-content glass-effect">
              <h3>Withdraw Funds</h3>
              <p className="modal-desc">Simulasikan penarikan dana dari wallet ke rekening bank Anda.</p>
              <input 
                type="text" 
                placeholder="Nomor Rekening Bank (misal BCA 12345678)" 
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
                className="amount-input"
                style={{marginBottom: '15px'}}
              />
              <input 
                type="number" 
                placeholder="Masukkan nominal (misal 100000)" 
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="amount-input"
              />
              <div className="modal-actions">
                <button className="btn-ghost" onClick={() => setShowWithdraw(false)}>Batal</button>
                <button className="btn-primary" onClick={handleWithdrawSubmit}>Tarik Dana</button>
              </div>
            </div>
          </div>
        )}

        <div className="transaction-history glass-effect" style={{ marginTop: '32px' }}>
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
                {transactions.map(tx => (
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
                    <td className={tx.type.includes('HOLD') || tx.type === 'WITHDRAW' || tx.type === 'AUCTION_SETTLE' ? 'text-red font-bold' : 'text-green font-bold'}>
                      {tx.type.includes('HOLD') || tx.type === 'WITHDRAW' || tx.type === 'AUCTION_SETTLE' ? '-' : '+'} Rp {tx.amount.toLocaleString('id-ID')}
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
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-light)' }}>Belum ada transaksi.</td>
                  </tr>
                )}
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
