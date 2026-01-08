import { useState, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTours } from '../../hooks/useTours';
import Card from '../../components/card/Card';
import styles from './TourPage.module.css';

export default function TourPage() {
  const { tours, loading, error } = useTours();
  
  // Refs cho scroll containers
  const domesticScrollRef = useRef<HTMLDivElement | null>(null);
  const internationalScrollRef = useRef<HTMLDivElement | null>(null);
  
  // State cho filters
  const [domesticFilter, setDomesticFilter] = useState<string>('all');
  const [internationalFilter, setInternationalFilter] = useState<string>('all');
  
  const domesticLocations = [
    { id: 'all', name: 'Tất cả' },
    { id: 'phu-quoc', name: 'Phú Quốc' },
    { id: 'nha-trang', name: 'Nha Trang' },
    { id: 'da-nang', name: 'Đà Nẵng' },
    { id: 'ninh-binh', name: 'Ninh Bình-Hạ Long' },
    { id: 'sapa', name: 'Sapa-Hà Giang' }
  ];
  
  const internationalCountries = [
    { id: 'all', name: 'Tất cả' },
    { id: 'korea', name: 'Hàn Quốc' },
    { id: 'japan', name: 'Nhật Bản' },
    { id: 'dubai', name: 'Dubai' },
    { id: 'china', name: 'Trung Quốc' },
    { id: 'singapore', name: 'Singapore' }
  ];
  
  const { domesticTours, internationalTours } = useMemo(() => {
    const domestic = tours.filter(tour => !tour._id.includes('_int_'));
    const international = tours.filter(tour => tour._id.includes('_int_'));
    return { domesticTours: domestic, internationalTours: international };
  }, [tours]);
  
  const filteredDomesticTours = useMemo(() => {
    if (domesticFilter === 'all') return domesticTours;
    
    return domesticTours.filter(tour => {
      const nameAndSpecs = tour.name.toLowerCase() + ' ' + 
        tour.specs?.map(s => s.v).join(' ').toLowerCase();
      
      switch(domesticFilter) {
        case 'phu-quoc':
          return nameAndSpecs.includes('phú quốc');
        case 'nha-trang':
          return nameAndSpecs.includes('nha trang');
        case 'da-nang':
          return nameAndSpecs.includes('đà nẵng') || nameAndSpecs.includes('hội an');
        case 'ninh-binh':
          return nameAndSpecs.includes('ninh bình') || 
                 nameAndSpecs.includes('hạ long') || 
                 nameAndSpecs.includes('hà nội');
        case 'sapa':
          return nameAndSpecs.includes('sapa') || nameAndSpecs.includes('hà giang');
        default:
          return true;
      }
    });
  }, [domesticTours, domesticFilter]);
  
  const filteredInternationalTours = useMemo(() => {
    if (internationalFilter === 'all') return internationalTours;
    
    return internationalTours.filter(tour => {
      const nameLower = tour.name.toLowerCase();
      
      switch(internationalFilter) {
        case 'korea':
          return nameLower.includes('hàn quốc') || nameLower.includes('seoul');
        case 'japan':
          return nameLower.includes('nhật bản') || nameLower.includes('tokyo');
        case 'dubai':
          return nameLower.includes('dubai') || nameLower.includes('abu dhabi');
        case 'china':
          return nameLower.includes('trung quốc') || nameLower.includes('bắc kinh');
        case 'singapore':
          return nameLower.includes('singapore');
        default:
          return true;
      }
    });
  }, [internationalTours, internationalFilter]);
  
  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 400;
      const newScrollPosition = ref.current.scrollLeft + 
        (direction === 'right' ? scrollAmount : -scrollAmount);
      
      ref.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.tourPage}>
        <div className={styles.loading}>Đang tải dữ liệu tours...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.tourPage}>
        <div className={styles.error}>Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.tourPage}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <h1>
              <span className={styles.icon}></span>
              Tour du lịch trong nước
            </h1>
          </div>
          
          <div className={styles.filterTabs}>
            {domesticLocations.map(location => (
              <button
                key={location.id}
                className={`${styles.tab} ${
                  domesticFilter === location.id ? styles.active : ''
                }`}
                onClick={() => setDomesticFilter(location.id)}
              >
                {location.name}
              </button>
            ))}
          </div>
          
         
          <div className={styles.tourSection}>
            <button 
              className={`${styles.scrollBtn} ${styles.scrollBtnLeft}`}
              onClick={() => scroll(domesticScrollRef, 'left')}
              aria-label="Scroll left"
            >
              ❮
            </button>
            
            <div className={styles.tourList} ref={domesticScrollRef}>
              {filteredDomesticTours.length > 0 ? (
                filteredDomesticTours.map(tour => (
                  <div key={tour._id} className={styles.cardWrapper}>
                    <Card tour={tour} />
                  </div>
                ))
              ) : (
                <div className={styles.noTours}>
                  Không tìm thấy tour phù hợp
                </div>
              )}
            </div>
            
            <button 
              className={`${styles.scrollBtn} ${styles.scrollBtnRight}`}
              onClick={() => scroll(domesticScrollRef, 'right')}
              aria-label="Scroll right"
            >
              ❯
            </button>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.header}>
            <h1>
              <span className={styles.icon}></span>
              Tour du lịch nước ngoài
            </h1>
          </div>
          
          <div className={styles.filterTabs}>
            {internationalCountries.map(country => (
              <button
                key={country.id}
                className={`${styles.tab} ${
                  internationalFilter === country.id ? styles.active : ''
                }`}
                onClick={() => setInternationalFilter(country.id)}
              >
                {country.name}
              </button>
            ))}
          </div>
          
          <div className={styles.tourSection}>
            <button 
              className={`${styles.scrollBtn} ${styles.scrollBtnLeft}`}
              onClick={() => scroll(internationalScrollRef, 'left')}
              aria-label="Scroll left"
            >
              ❮
            </button>
            
            <div className={styles.tourList} ref={internationalScrollRef}>
              {filteredInternationalTours.length > 0 ? (
                filteredInternationalTours.map(tour => (
                  <div key={tour._id} className={styles.cardWrapper}>
                    <Card tour={tour} />
                  </div>
                ))
              ) : (
                <div className={styles.noTours}>
                  Không tìm thấy tour phù hợp
                </div>
              )}
            </div>
            
            <button 
              className={`${styles.scrollBtn} ${styles.scrollBtnRight}`}
              onClick={() => scroll(internationalScrollRef, 'right')}
              aria-label="Scroll right"
            >
              ❯
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}