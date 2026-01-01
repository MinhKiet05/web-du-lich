import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';
import logo from '../../assets/logo.png';
export default function Header() {
  const { currentUser, login, logout, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAuthClick = async () => {
    try {
      if (currentUser) {
        await logout();
      } else {
        await login();
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    setShowDropdown(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleMobileNavClick = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <button className={styles.hamburgerBtn} onClick={toggleMobileMenu}>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
        
        <div className={styles.logo}>
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </div>
        
        <nav className={styles.nav}>
          <Link to="/">Trang chủ</Link>
          <Link to="/tours">Tour</Link>
          <Link to="/about">Về chúng tôi</Link>
        </nav>

        <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Tìm kiếm tour..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{width: '20px', height: '20px', marginTop: '4px'}}>
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
          </button>
        </form>

        <div className={styles.authSection}>
          {loading ? (
            <div className={styles.loading}>Đang tải...</div>
          ) : currentUser ? (
            <div className={styles.userProfileContainer} ref={dropdownRef}>
              <div className={styles.userProfile} onClick={toggleDropdown}>
                <img 
                  src={currentUser.photoURL || '/default-avatar.svg'} 
                  alt={currentUser.displayName || 'User'} 
                  className={styles.avatar}
                />
                <span className={styles.userName}>{currentUser.displayName}</span>
                <svg className={`${styles.dropdownArrow} ${showDropdown ? styles.dropdownArrowUp : ''}`} viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" fill="currentColor"/>
                </svg>
              </div>
              {showDropdown && (
                <div className={styles.dropdownMenu}>
                  <button 
                    className={styles.dropdownItem} 
                    onClick={() => handleMenuClick('/my-tours')}
                  >
                    Tour đã đặt
                  </button>
                  <hr className={styles.dropdownDivider} />
                  <button 
                    className={styles.dropdownItem} 
                    onClick={handleLogout}
                  >
                    <svg className={styles.dropdownIcon} viewBox="0 0 24 24">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/>
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
                <button onClick={handleAuthClick} className={styles.loginBtn}>
                  Đăng nhập
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
          )}
        </div>
        
        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className={styles.mobileMenuDropdown} ref={mobileMenuRef}>
            <nav className={styles.mobileNav}>
              <Link to="/" onClick={() => handleMobileNavClick('/')}>Trang chủ</Link>
              <Link to="/tours" onClick={() => handleMobileNavClick('/tours')}>Tour</Link>
              <Link to="/about" onClick={() => handleMobileNavClick('/about')}>Về chúng tôi</Link>
            </nav>
            
            <div className={styles.mobileSearchForm}>
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Tìm kiếm tour..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.mobileSearchInput}
                />
                <button type="submit" className={styles.mobileSearchButton}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}   