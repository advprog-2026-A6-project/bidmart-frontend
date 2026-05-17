import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuctionDetail from './pages/AuctionDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auctions/:auctionId" element={<AuctionDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
