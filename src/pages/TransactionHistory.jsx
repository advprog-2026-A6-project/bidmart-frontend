import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Filter, Clock, CheckCircle } from 'lucide-react';
import { walletApi } from '../api/walletApi';
import './TransactionHistory.css';
import './Wallet.css';

const TransactionHistory = () => {
  const navigate = useNavigate();

  // Mengambil data user secara dinamis dari localStorage
  const storedUser = localStorage.getItem('user');
  const currentUserId = storedUser ? JSON.parse(storedUser).id : null;

  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      alert("Sesi Anda telah berakhir atau Anda belum login. Silakan login kembali.");
      navigate('/login');
      return;
    }

    const loadFullHistory = async () => {
      try {
        setIsLoading(true);
        const data = await walletApi.getHistory(currentUserId);
        setAllTransactions(data);
        setFilteredTransactions(data);
      } catch (err) {
        console.error("Gagal menarik histori mutasi:", err);
        alert("Gagal memuat histori transaksi: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadFullHistory();
  }, [currentUserId]);

  useEffect(() => {
    if (filterType === 'ALL') {
      setFilteredTransactions(allTransactions);
    } else {
      setFilteredTransactions(allTransactions.filter(tx => tx.type === filterType));
    }
  }, [filterType, allTransactions]);

  const formatIsoDate = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', { hour12: false }).replace(',', '');
  };

  if (isLoading) {
    return (
        <div className="page-wrapper">
          <Navbar />
          <div className="wallet-container" style={{textAlign: 'center', padding: '100px'}}>
            <div className="loading-spinner">Memuat riwayat transaksi...</div>
          </div>
          <Footer />
        </div>
    );
  }

  return (
      <div className="page-wrapper">
        <Navbar />
        <div className="wallet-container">
          <div className="wallet-header">
            <h1 className="wallet-title"><Clock size={28} /> Riwayat Mutasi Dompet</h1>
            <p className="wallet-subtitle">Seluruh mutasi dana masuk, keluar, dan penahanan dana jaminan lelang terekam di sini.</p>
          </div>

          <div className="filter-toolbar glass-effect">
            <div className="filter-label">
              <Filter size={18} /> <span>Filter Tipe Mutasi:</span>
            </div>
            <div className="filter-buttons">
              {['ALL', 'TOP_UP', 'WITHDRAW', 'HOLD', 'RELEASE', 'PAYMENT', 'RECEIPT'].map((type) => (
                  <button
                      key={type}
                      className={`filter-btn ${filterType === type ? 'active' : ''}`}
                      onClick={() => setFilterType(type)}
                  >
                    {type === 'ALL' ? 'Semua' : type.replace('_', ' ')}
                  </button>
              ))}
            </div>
          </div>

          <div className="transaction-history" style={{marginTop: '20px'}}>
            <div className="table-responsive">
              <table className="tx-table">
                <thead>
                <tr>
                  <th>ID Transaksi</th>
                  <th>Tanggal & Waktu</th>
                  <th>Tipe</th>
                  <th>Deskripsi</th>
                  <th>Jumlah</th>
                  <th>Sisa Saldo</th>
                </tr>
                </thead>
                <tbody>
                {filteredTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="tx-id-cell">#TRX-{tx.id}</td>
                      <td>{formatIsoDate(tx.createdAt)}</td>
                      <td><span className={`badge ${tx.type.toLowerCase()}`}>{tx.type.replace('_', ' ')}</span></td>
                      <td>{tx.description}</td>
                      <td className={['HOLD', 'WITHDRAW', 'PAYMENT'].includes(tx.type) ? 'text-red font-bold' : 'text-green font-bold'}>
                        {['HOLD', 'WITHDRAW', 'PAYMENT'].includes(tx.type) ? '-' : '+'} Rp {tx.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="balance-snapshot">
                        <div>Avail: Rp {tx.balanceAfter?.toLocaleString('id-ID')}</div>
                        <div style={{color: 'var(--text-light)', fontSize: '0.75rem'}}>Held: Rp {tx.heldBalanceAfter?.toLocaleString('id-ID')}</div>
                      </td>
                    </tr>
                ))}
                {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: 'var(--text-light)'}}>
                        Tidak ditemukan riwayat mutasi untuk filter ini.
                      </td>
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