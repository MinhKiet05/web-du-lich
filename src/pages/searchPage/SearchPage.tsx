
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import Card from '../../components/card/Card';
import { searchToursFromFirebase } from '../../utils/firebaseHelpers';
import styles from './SearchPage.module.css';

interface Tour {
  _id: string;
  name: string;
  short_name: string;
  type: string;
  price: {
    amount: number;
    currency: string;
    display: string;
  };
  rating_summary?: {
    average: number;
    count: number;
  };
  upcoming_departures: Array<{
    date: string;
    day_of_week: string;
    seats_left: number;
  }>;
  specs: Array<{
    k: string;
    v: string;
  }>;
  images: Array<{
    url: string;
    caption: string;
  }>;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');
  const [tours, setTours] = useState<Tour[]>([]);
  const [displayedTours, setDisplayedTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 6;

  useEffect(() => {
    // Tự động search khi component mount hoặc params thay đổi
    const query = searchParams.get('q');
    const date = searchParams.get('date');
    
    setSearchQuery(query || '');
    setSelectedDate(date || '');
    
    if (query || date) {
      performSearch(query || '', date || '');
    }
  }, [searchParams]);

  const performSearch = async (query: string, date: string) => {
    if (!query && !date) return;
    
    setLoading(true);
    setHasSearched(true);
    setCurrentPage(1);
    
    try {
      const results = await searchToursFromFirebase(query, date);
      setTours(results);
      setDisplayedTours(results.slice(0, toursPerPage));
    } catch (error) {
      console.error('Error searching tours:', error);
      setTours([]);
      setDisplayedTours([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery && !selectedDate) return;
    
    // Cập nhật URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedDate) params.set('date', selectedDate);
    setSearchParams(params);
  };

  const loadMoreTours = () => {
    const nextPage = currentPage + 1;
    const startIndex = nextPage * toursPerPage;
    const newTours = tours.slice(toursPerPage, startIndex);
    
    setDisplayedTours(prev => [...prev, ...newTours]);
    setCurrentPage(nextPage);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className={styles.searchPage}>
      <div className={styles.container}>
        <div className={styles.searchHeader}>
          <h1>Tìm kiếm tour</h1>
          
          <form onSubmit={handleSubmit} className={styles.searchForm}>
            <div className={styles.searchInputs}>
              <div className={styles.searchField}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Tìm theo tên tour (VD: Phú Quốc, Đà Lạt...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              
              <div className={styles.searchField}>
                <FontAwesomeIcon icon={faCalendarDays} className={styles.searchIcon} />
                <input
                  type="date"
                  placeholder="Chọn ngày khởi hành"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
              
              <button type="submit" className={styles.searchButton}>
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>

        <div className={styles.searchResults}>
          {loading && (
            <div className={styles.loading}>Đang tìm kiếm...</div>
          )}
          
          {!loading && hasSearched && tours.length === 0 && (
            <div className={styles.noResults}>
              <h3>Không tìm thấy tour phù hợp</h3>
              <p>Thử tìm kiếm với từ khóa hoặc ngày khác</p>
            </div>
          )}
          
          {!loading && displayedTours.length > 0 && (
            <>
              <div className={styles.resultsHeader}>
                <h2>Kết quả tìm kiếm ({tours.length} tour)</h2>
              </div>
              
              <div className={styles.resultsGrid}>
                {displayedTours.map((tour) => (
                  <Card key={tour._id} tour={tour} />
                ))}
              </div>
              
              {displayedTours.length < tours.length && (
                <div className={styles.loadMoreContainer}>
                  <button 
                    onClick={loadMoreTours}
                    className={styles.loadMoreButton}
                  >
                    Xem thêm ({tours.length - displayedTours.length} tour còn lại)
                  </button>
                </div>
              )}
            </>
          )}
          
          {!hasSearched && (
            <div className={styles.searchPlaceholder}>
              <h3>Nhập tên tour hoặc chọn ngày để tìm kiếm</h3>
              <p>Ví dụ: "Phú Quốc", "Đà Lạt", "Nha Trang"...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}