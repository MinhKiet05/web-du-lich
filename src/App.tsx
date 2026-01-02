import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/header/Header';
import HomePage from './pages/homePage/HomePage';
import TourPage from './pages/tourPage/TourPage';
import AboutPage from './pages/aboutPage/AboutPage';
import SearchPage from './pages/searchPage/SearchPage';
import MyTours from './pages/myToursPage/MyTours';
import Footer from './components/footer/Footer';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tours" element={<TourPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/my-tours" element={<MyTours />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
