import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import TrendingAuctions from '../components/TrendingAuctions';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrendingAuctions />
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;
