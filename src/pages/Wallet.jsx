import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, ArrowRight, Landmark } from 'lucide-react';
import { walletApi } from '../api/walletApi';
import './Wallet.css';

const Wallet = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user');
  const currentUserId = storedUser ? JSON.parse(storedUser).id : null;

  const [availableBalance, setAvailableBalance] = useState(0);
  const [heldBalance, setHeldBalance] = useState(0);
  const [bankBalance, setBankBalance] = useState(0);
  const [bankAccountInfo, setBankAccountInfo] = useState('');
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpStep, setTopUpStep] = useState(1);
  const [activeVaDetails, setActiveVaDetails] = useState(null);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const fetchAllWalletData = async () => {
    if (!currentUserId) return;
    try {
      setIsLoading(true);
      const [wallet, bank, history] = await Promise.all([
        walletApi.getWallet(currentUserId),
        walletApi.getBankAccount(currentUserId),
        walletApi.getHistory(currentUserId)
      ]);

      setAvailableBalance(wallet.balance || 0);
      setHeldBalance(wallet.heldBalance || 0);
      setBankBalance(bank.balance || 0);
      setBankAccountInfo(`${bank.bankName || 'BCA'} - ${bank.accountNumber || ''}`);
      setRecentTransactions(history.slice(0, 3)); // Ambil 3 transaksi terbaru
    } catch (err) {
      console.error("Gagal memuat data dompet:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUserId) {
      alert("Sesi Anda telah berakhir atau Anda belum login. Silakan login kembali.");
      navigate('/login');
      return;
    }
    fetchAllWalletData();
  }, [currentUserId]);

  const handleRequestTopUp = async () => {
    if (!topUpAmount || isNaN(topUpAmount) || topUpAmount <= 0) {
      alert("Masukkan nominal top up yang valid");
      return;
    }
    try {
      const data = await walletApi.initiateTopUp(currentUserId, topUpAmount);
      setActiveVaDetails(data);
      setTopUpStep(2);
    } catch (err) {
      alert("Gagal menginisiasi top up: " + err.message);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      await walletApi.confirmTopUp(currentUserId, activeVaDetails.amount, activeVaDetails.paymentReference);
      alert("Top up sukses disimulasikan!");
      setShowTopUpModal(false);
      setTopUpAmount('');
      setTopUpStep(1);
      setActiveVaDetails(null);
      fetchAllWalletData();
    } catch (err) {
      alert("Konfirmasi pembayaran gagal: " + err.message);
    }
  };

  const handleRequestWithdraw = async () => {
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert("Masukkan nominal penarikan yang valid");
      return;
    }
    try {
      await walletApi.withdraw(currentUserId, withdrawAmount);
      alert("Penarikan dana berhasil dikirim ke rekening bank Anda!");
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      fetchAllWalletData();
    } catch (err) {
      alert("Penarikan gagal: " + err.message);
    }
  };

  const formatIsoDate = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', { hour12: false }).replace(',', '');
  };

  if (isLoading) {
    return (
        <div className="wallet-container page-layout">
          <Navbar />
          <div className="wallet-content-wrapper" style={{textAlign: 'center', padding: '100px'}}>
            <div className="loading-spinner">Memuat data dompet...</div>
          </div>
          <Footer />
        </div>
    );
  }

  return (
      <div className="wallet-container page-layout">
        <Navbar />
        <div className="wallet-content-wrapper">
          <div className="wallet-header-section">
            <h1 className="wallet-title"><WalletIcon size={28} /> Dompet Saya</h1>
            <p className="wallet-subtitle">Kelola saldo, penarikan dana, dan lacak riwayat transaksi penawaran lelang Anda.</p>
          </div>

          <div className="wallet-dashboard-grid">
            <div className="balance-card primary-gradient">
              <div className="card-top">
                <span className="card-label">Saldo Aktif (Available)</span>
                <WalletIcon size={24} className="opacity-75" />
              </div>
              <div className="card-balance">Rp {availableBalance.toLocaleString('id-ID')}</div>
              <div className="card-footer-info">
                <span>Dana Tertahan (Held): <strong>Rp {heldBalance.toLocaleString('id-ID')}</strong></span>
              </div>
            </div>

            <div className="bank-account-card glass-effect">
              <div className="card-top">
                <span className="card-label">Rekening Terhubung</span>
                <Landmark size={24} className="text-primary" />
              </div>
              <div className="bank-info-main">{bankAccountInfo}</div>
              <div className="bank-balance-sub">Saldo Bank Atas Nama: Rp {bankBalance.toLocaleString('id-ID')}</div>
            </div>
          </div>

          <div className="wallet-actions-row">
            <button className="btn-action topup" onClick={() => { setTopUpStep(1); setShowTopUpModal(true); }}>
              <ArrowDownLeft size={20} /> Top Up Saldo
            </button>
            <button className="btn-action withdraw" onClick={() => setShowWithdrawModal(true)}>
              <ArrowUpRight size={20} /> Tarik Dana (Withdraw)
            </button>
          </div>

          <div className="transactions-preview-section glass-effect">
            <div className="section-header">
              <h3>Aktivitas Transaksi Terakhir</h3>
              <Link to="/wallet/history" className="see-all-link">Lihat Semua <ArrowRight size={16} /></Link>
            </div>

            <div className="table-responsive">
              <table className="transaction-table">
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
                {recentTransactions.map((tx) => (
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
                {recentTransactions.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-light)' }}>Belum ada riwayat transaksi.</td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showTopUpModal && (
            <div className="modal-overlay">
              <div className="modal-content glass-effect">
                {topUpStep === 1 ? (
                    <>
                      <h3>Isi Saldo (Top Up)</h3>
                      <p className="modal-desc">Masukkan nominal saldo yang ingin ditambahkan ke dompet BidMart Anda.</p>
                      <input
                          type="number"
                          placeholder="Masukkan nominal (Contoh: 50000)"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          className="amount-input"
                      />
                      <div className="modal-actions">
                        <button className="btn-ghost" onClick={() => setShowTopUpModal(false)}>Batal</button>
                        <button className="btn-primary" onClick={handleRequestTopUp}>Lanjutkan Pembayaran</button>
                      </div>
                    </>
                ) : (
                    <>
                      <h3>Simulasi Transfer Bank (Virtual Account)</h3>
                      <div className="va-details-box text-left">
                        <p><strong>Bank Tujuan:</strong> {activeVaDetails?.bankName}</p>
                        <p><strong>Nomor Virtual Account:</strong> <code className="va-code">{activeVaDetails?.virtualAccountNumber}</code></p>
                        <p><strong>Total Tagihan:</strong> Rp {activeVaDetails?.amount?.toLocaleString('id-ID')}</p>
                        <p style={{fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '10px'}}>
                          *Gunakan tombol di bawah untuk menyimulasikan respon sukses dari pihak sistem webhook perbankan.
                        </p>
                      </div>
                      <div className="modal-actions">
                        <button className="btn-ghost" onClick={() => { setTopUpStep(1); setActiveVaDetails(null); }}>Kembali</button>
                        <button className="btn-primary" onClick={handleConfirmPayment}>Konfirmasi Pembayaran Sukses</button>
                      </div>
                    </>
                )}
              </div>
            </div>
        )}

        {showWithdrawModal && (
            <div className="modal-overlay">
              <div className="modal-content glass-effect">
                <h3>Penarikan Dana (Withdraw)</h3>
                <p className="modal-desc">Dana akan ditransfer keluar langsung menuju rekening yang terhubung ({bankAccountInfo}).</p>
                <input
                    type="number"
                    placeholder="Masukkan nominal penarikan"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="amount-input"
                />
                <div className="modal-actions">
                  <button className="btn-ghost" onClick={() => setShowWithdrawModal(false)}>Batal</button>
                  <button className="btn-primary" onClick={handleRequestWithdraw}>Eksekusi Penarikan</button>
                </div>
              </div>
            </div>
        )}

        <Footer />
      </div>
  );
};

export default Wallet;