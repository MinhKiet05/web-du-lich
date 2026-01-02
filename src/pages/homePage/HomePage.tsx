import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import backgroundImage from '../../assets/du-lich.webp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faCalendarDays, faSearch } from '@fortawesome/free-solid-svg-icons';
import Card from '../../components/card/Card';
import toursData from '../../data/Tours.json';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSearchContainerClick = () => {
    searchInputRef.current?.focus();
  };

  const handleDateContainerClick = () => {
    dateInputRef.current?.focus();
    dateInputRef.current?.showPicker?.();
  };

  // Lấy 6 tours đầu tiên để hiển thị
  const featuredTours = toursData.slice(0, 6);

  return (
    <div className={styles.homePage}>
      <section style={{ backgroundImage: `url(${backgroundImage})` }}  >
        <div className={styles.inSection}>
          <div className={styles.content}>
            <div className={styles.header}>
              <h1>Tìm kiếm địa điểm tiếp theo để tham quan</h1>
              <p>Hãy lựa chọn hàng ngàn chuyến phiêu lưu được tổ chức sẵn.</p>
            </div>
            
            <div className={styles.searchBox}>
              <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
                
                <div className={styles.searchInputContainer} onClick={handleSearchContainerClick}>
                  <FontAwesomeIcon icon={faLocationDot} className={styles.inputIcon} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Tìm kiếm tour..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                <div className={styles.thanhNganCach} onClick={handleDateContainerClick}>
                  <FontAwesomeIcon icon={faCalendarDays} className={styles.inputIcon} />
                  <input ref={dateInputRef} type="date" className={styles.searchInput} />
                </div>
                <button type="submit" className={styles.searchButton}>
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </form>
            </div>
            
            <div className={styles.footer}>
              <a 
                href="#" 
                className={styles.seeAllButton} 
                onClick={(e) => { 
                  e.preventDefault(); 
                  setSearchQuery(''); 
                  searchInputRef.current?.focus(); 
                }}
              >
                Xem tất cả các tour hiện tại →
              </a>
              
              <div className={styles.decorativeElements}>
                <div className={styles.statsContainer}>
                  Khám phá thế giới, trải nghiệm không giới hạn!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className={styles.toursSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Tour Hot Nhất</h2>
          <div className={styles.toursGrid}>
            {featuredTours.map((tour) => (
              <Card key={tour._id} tour={tour} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}