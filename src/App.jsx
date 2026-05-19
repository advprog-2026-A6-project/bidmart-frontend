import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuctionDetail from './pages/AuctionDetail';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import TransactionHistory from './pages/TransactionHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auctions/:auctionId" element={<AuctionDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/transactions" element={<TransactionHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
