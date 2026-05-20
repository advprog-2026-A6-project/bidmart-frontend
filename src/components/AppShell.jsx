import Navbar from './Navbar';
import Footer from './Footer';

const AppShell = ({ children }) => {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-main">{children}</main>
      <Footer />
    </div>
  );
};

export default AppShell;
