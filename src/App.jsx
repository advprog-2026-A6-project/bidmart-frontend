import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuctionList from './pages/AuctionList';
import AuctionDetail from './pages/AuctionDetail';
import AuctionCreate from './pages/AuctionCreate';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import TransactionHistory from './pages/TransactionHistory';
import OrderList from './pages/OrderList';
import NotificationList from './pages/NotificationList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auctions" element={<AuctionList />} />
        <Route path="/explore" element={<AuctionList />} />
        <Route path="/sell" element={<AuctionCreate />} />
        <Route path="/auctions/:auctionId" element={<AuctionDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/notifications" element={<NotificationList />} />
      </Routes>
    </Router>
  );
}

export default App;
