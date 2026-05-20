import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import './TransactionHistory.css';
import './Wallet.css'; 

const allTransactions = [
  { id: 'TRX-9982', type: 'TOP_UP', amount: 500000, date: '2026-05-18 14:30', status: 'SUCCESS', availableBalance: 300000, heldBalance: 0, desc: 'Top up via System' },
  { id: 'TRX-9983', type: 'RECEIPT', amount: 50000, date: '2026-05-18 15:38', status: 'SUCCESS', ref: 'AUC-102', availableBalance: 350000, heldBalance: 0, desc: 'Penerimaan dana dari hasil lelang' },
  { id: 'TRX-9984', type: 'BID_RELEASE', amount: 1000, date: '2026-05-19 09:15', status: 'SUCCESS', ref: 'AUC-098', availableBalance: 351000, heldBalance: 0, desc: 'Release dana bid' },
  { id: 'TRX-9985', type: 'AUCTION_SETTLE', amount: 45000, date: '2026-05-17 11:20', status: 'SUCCESS', ref: 'AUC-055', availableBalance: 306000, heldBalance: 0, desc: 'Settle to seller' },
  { id: 'TRX-9986', type: 'WITHDRAW', amount: 200000, date: '2026-05-16 10:05', status: 'PENDING', ref: 'BNK-123', availableBalance: 106000, heldBalance: 0, desc: 'Tarik saldo ke BCA 123456' },
  { id: 'TRX-9987', type: 'TOP_UP', amount: 100000, date: '2026-05-15 08:30', status: 'FAILED', availableBalance: 106000, heldBalance: 0, desc: 'Top up via System' },
];

const TransactionHistory = () => {
  const [filter, setFilter] = useState('ALL');

  const filteredTxs = allTransactions.filter(tx => {
    if (filter === 'ALL') return true;
    if (filter === 'IN') return tx.type === 'TOP_UP' || tx.type === 'BID_RELEASE';
    if (filter === 'OUT') return tx.type === 'WITHDRAW' || tx.type === 'BID_HOLD' || tx.type === 'AUCTION_SETTLE';
    return true;
  });

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="tx-history-container container">
        <div className="tx-history-header">
          <h1>All Transactions</h1>
          <p>View your complete wallet history.</p>
        </div>

        <div className="tx-controls glass-effect">
          <div className="filter-group">
            <Filter size={18} className="text-light" style={{color: 'var(--text-light)'}}/>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
              <option value="ALL">All Transactions</option>
              <option value="IN">Money In (Top Up, Release)</option>
              <option value="OUT">Money Out (Withdraw, Hold, Settle)</option>
            </select>
          </div>
        </div>

        <div className="transaction-history-full glass-effect">
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
                {filteredTxs.map(tx => (
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
                        tx.status === 'PENDING' ?
                        <div className="status-cell" style={{color: '#d97706'}}><Clock size={16} /> Pending</div> :
                        <div className="status-cell text-red"><XCircle size={16} /> Failed</div>
                      }
                    </td>
                  </tr>
                ))}
                {filteredTxs.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '30px', color: 'var(--text-light)'}}>No transactions found.</td>
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

export default TransactionHistory;
