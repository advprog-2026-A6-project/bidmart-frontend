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
import ListingList from './pages/ListingList';
import ListingDetail from './pages/ListingDetail';
import ListingCreate from './pages/ListingCreate';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import AdminAuthPage from './pages/AdminAuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalNotificationToasts from './components/GlobalNotificationToasts';
import AuthProvider from './context/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalNotificationToasts />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/catalog" element={<ListingList />} />
          <Route
            path="/catalog/new"
            element={(
              <ProtectedRoute requiredAuthority="auction:create">
                <ListingCreate />
              </ProtectedRoute>
            )}
          />
          <Route path="/catalog/:listingId" element={<ListingDetail />} />
          <Route path="/auctions" element={<AuctionList />} />
          <Route path="/explore" element={<AuctionList />} />
          <Route
            path="/sell"
            element={(
              <ProtectedRoute requiredAuthority="auction:create">
                <AuctionCreate />
              </ProtectedRoute>
            )}
          />
          <Route path="/auctions/:auctionId" element={<AuctionDetail />} />
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/account"
            element={(
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin/auth"
            element={(
              <ProtectedRoute requiredAnyAuthority={['rbac:manage', 'user:deactivate']}>
                <AdminAuthPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/wallet"
            element={(
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/transactions"
            element={(
              <ProtectedRoute>
                <TransactionHistory />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/orders"
            element={(
              <ProtectedRoute>
                <OrderList />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/notifications"
            element={(
              <ProtectedRoute>
                <NotificationList />
              </ProtectedRoute>
            )}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
