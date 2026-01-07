
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCalendarDays, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Card from '../../components/card/Card';
import { getAllToursFromFirebase } from '../../utils/firebaseHelpers';
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

interface FilterState {
  destinations: string[];
  priceRange: [number, number];
  durationRange: [number, number];
  activities: string[];
  tripTypes: string[];
}

// Hàm trích xuất số ngày từ type string
const extractDays = (type: string): number => {
  const match = type.match(/(\d+)\s*ngày/i);
  return match ? parseInt(match[1]) : 0;
};

// Hàm trích xuất địa điểm từ specs
const extractDestination = (specs: Array<{ k: string; v: string }>): string => {
  const locationEnd = specs.find(s => s.k === 'location_end');
  return locationEnd?.v || '';
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [displayedTours, setDisplayedTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 6;

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    destinations: [],
    priceRange: [0, 10000000],
    durationRange: [0, 10],
    activities: [],
    tripTypes: []
  });

  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState({
    destination: false,
    price: false,
    duration: false,
    activities: false,
    tripTypes: false
  });

  // Show more states
  const [showAllDestinations, setShowAllDestinations] = useState(false);

  // Lấy danh sách filters từ dữ liệu
  const filterOptions = useMemo(() => {
    const destinations: { [key: string]: number } = {};
    const tripTypes: { [key: string]: number } = {};
    let minPrice = Infinity;
    let maxPrice = 0;
    let maxDays = 0;

    allTours.forEach(tour => {
      // Destinations
      const dest = extractDestination(tour.specs);
      if (dest) {
        destinations[dest] = (destinations[dest] || 0) + 1;
      }

      // Trip Types (theo type)
      if (tour.type) {
        tripTypes[tour.type] = (tripTypes[tour.type] || 0) + 1;
      }

      // Price range
      if (tour.price?.amount) {
        minPrice = Math.min(minPrice, tour.price.amount);
        maxPrice = Math.max(maxPrice, tour.price.amount);
      }

      // Duration
      const days = extractDays(tour.type);
      if (days > maxDays) maxDays = days;
    });

    return {
      destinations: Object.entries(destinations).map(([name, count]) => ({ name, count })),
      tripTypes: Object.entries(tripTypes).map(([name, count]) => ({ name, count })),
      priceRange: [minPrice === Infinity ? 0 : minPrice, maxPrice] as [number, number],
      maxDays
    };
  }, [allTours]);

  // Load tất cả tours khi mount
  useEffect(() => {
    const loadAllTours = async () => {
      setLoading(true);
      try {
        const results = await getAllToursFromFirebase() as Tour[];
        setAllTours(results);
        setTours(results);
        setDisplayedTours(results.slice(0, toursPerPage));
        setHasSearched(true);
        
        // Set initial price range
        if (results.length > 0) {
          const prices = results.map(t => t.price?.amount || 0);
          const minP = Math.min(...prices);
          const maxP = Math.max(...prices);
          setFilters(prev => ({ ...prev, priceRange: [minP, maxP] }));
        }
      } catch (error) {
        console.error('Error loading tours:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAllTours();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...allTours];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(tour => {
        const name = tour.name?.toLowerCase() || '';
        const shortName = tour.short_name?.toLowerCase() || '';
        return name.includes(query) || shortName.includes(query);
      });
    }

    // Date filter
    if (selectedDate) {
      const searchDate = new Date(selectedDate);
      filtered = filtered.filter(tour => {
        if (!tour.upcoming_departures?.length) return false;
        return tour.upcoming_departures.some((dep: any) => {
          const depDate = new Date(dep.date);
          return depDate.toDateString() === searchDate.toDateString();
        });
      });
    }

    // Destination filter
    if (filters.destinations.length > 0) {
      filtered = filtered.filter(tour => {
        const dest = extractDestination(tour.specs);
        return filters.destinations.includes(dest);
      });
    }

    // Price filter
    filtered = filtered.filter(tour => {
      const price = tour.price?.amount || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Duration filter
    if (filters.durationRange[1] > 0) {
      filtered = filtered.filter(tour => {
        const days = extractDays(tour.type);
        return days >= filters.durationRange[0] && days <= filters.durationRange[1];
      });
    }

    // Trip Types filter
    if (filters.tripTypes.length > 0) {
      filtered = filtered.filter(tour => {
        return filters.tripTypes.includes(tour.type);
      });
    }

    setTours(filtered);
    setDisplayedTours(filtered.slice(0, toursPerPage));
    setCurrentPage(1);
  }, [allTours, searchQuery, selectedDate, filters]);

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

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleDestinationChange = (dest: string) => {
    setFilters(prev => ({
      ...prev,
      destinations: prev.destinations.includes(dest)
        ? prev.destinations.filter(d => d !== dest)
        : [...prev.destinations, dest]
    }));
  };

  const handleTripTypeChange = (type: string) => {
    setFilters(prev => ({
      ...prev,
      tripTypes: prev.tripTypes.includes(type)
        ? prev.tripTypes.filter(t => t !== type)
        : [...prev.tripTypes, type]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      destinations: [],
      priceRange: filterOptions.priceRange,
      durationRange: [0, filterOptions.maxDays || 10],
      activities: [],
      tripTypes: []
    });
    setSearchQuery('');
    setSelectedDate('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const displayedDestinations = showAllDestinations 
    ? filterOptions.destinations 
    : filterOptions.destinations.slice(0, 4);

  return (
    <div className={styles.searchPage}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Tours</h1>

        <div className={styles.mainContent}>
          {/* Sidebar */}
          <aside className={styles.filterSidebar}>
            <div className={styles.filterHeader}>
              <h3>Tiêu chí</h3>
              <button onClick={clearAllFilters} className={styles.clearAll}>
                Xóa tất cả
              </button>
            </div>

            {/* Filter điểm đến */}
            <div className={styles.filterSection}>
              <div 
                className={styles.filterSectionHeader}
                onClick={() => toggleSection('destination')}
              >
                <span>Điểm đến</span>
                <FontAwesomeIcon icon={collapsedSections.destination ? faChevronDown : faChevronUp} />
              </div>
              {!collapsedSections.destination && (
                <div className={styles.filterOptions}>
                  {displayedDestinations.map(dest => (
                    <label key={dest.name} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.destinations.includes(dest.name)}
                        onChange={() => handleDestinationChange(dest.name)}
                      />
                      <span className={styles.checkboxCustom}></span>
                      <span className={styles.optionText}>{dest.name}</span>
                      <span className={styles.optionCount}>{dest.count}</span>
                    </label>
                  ))}
                  {filterOptions.destinations.length > 4 && (
                    <button 
                      className={styles.showMoreBtn}
                      onClick={() => setShowAllDestinations(!showAllDestinations)}
                    >
                      {showAllDestinations ? 'Thu gọn' : `Xem tất cả ${filterOptions.destinations.length}`}
                      <FontAwesomeIcon icon={showAllDestinations ? faChevronUp : faChevronDown} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Filter giá */}
            <div className={styles.filterSection}>
              <div 
                className={styles.filterSectionHeader}
                onClick={() => toggleSection('price')}
              >
                <span>Giá</span>
                <FontAwesomeIcon icon={collapsedSections.price ? faChevronDown : faChevronUp} />
              </div>
              {!collapsedSections.price && (
                <div className={styles.filterOptions}>
                  <div className={styles.rangeSlider}>
                    <input
                      type="range"
                      min={filterOptions.priceRange[0]}
                      max={filterOptions.priceRange[1]}
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [parseInt(e.target.value), prev.priceRange[1]]
                      }))}
                      className={styles.rangeInput}
                    />
                    <input
                      type="range"
                      min={filterOptions.priceRange[0]}
                      max={filterOptions.priceRange[1]}
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                      }))}
                      className={styles.rangeInput}
                    />
                  </div>
                  <div className={styles.rangeValues}>
                    <span>{formatPrice(filters.priceRange[0])}đ</span>
                    <span>{formatPrice(filters.priceRange[1])}đ</span>
                  </div>
                </div>
              )}
            </div>

            {/* Filter thời gian */}
            <div className={styles.filterSection}>
              <div 
                className={styles.filterSectionHeader}
                onClick={() => toggleSection('duration')}
              >
                <span>Thời gian</span>
                <FontAwesomeIcon icon={collapsedSections.duration ? faChevronDown : faChevronUp} />
              </div>
              {!collapsedSections.duration && (
                <div className={styles.filterOptions}>
                  <div className={styles.rangeSlider}>
                    <input
                      type="range"
                      min={0}
                      max={filterOptions.maxDays || 10}
                      value={filters.durationRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        durationRange: [parseInt(e.target.value), prev.durationRange[1]]
                      }))}
                      className={styles.rangeInput}
                    />
                    <input
                      type="range"
                      min={0}
                      max={filterOptions.maxDays || 10}
                      value={filters.durationRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        durationRange: [prev.durationRange[0], parseInt(e.target.value)]
                      }))}
                      className={styles.rangeInput}
                    />
                  </div>
                  <div className={styles.rangeValues}>
                    <span>{filters.durationRange[0]} Ngày</span>
                    <span>{filters.durationRange[1]} Ngày</span>
                  </div>
                </div>
              )}
            </div>

            {/* Filer loại tour */}
            <div className={styles.filterSection}>
              <div 
                className={styles.filterSectionHeader}
                onClick={() => toggleSection('tripTypes')}
              >
                <span>Loại Tour</span>
                <FontAwesomeIcon icon={collapsedSections.tripTypes ? faChevronDown : faChevronUp} />
              </div>
              {!collapsedSections.tripTypes && (
                <div className={styles.filterOptions}>
                  {filterOptions.tripTypes.map(type => (
                    <label key={type.name} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.tripTypes.includes(type.name)}
                        onChange={() => handleTripTypeChange(type.name)}
                      />
                      <span className={styles.checkboxCustom}></span>
                      <span className={styles.optionText}>{type.name}</span>
                      <span className={styles.optionCount}>{type.count}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles.resultsSection}>
            <form onSubmit={handleSubmit} className={styles.searchForm}>
              <div className={styles.searchInputs}>
                <div className={styles.searchField}>
                  <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Tìm theo tên tour"
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

            {/* Cục sắp xếp mới nhất đó cha */}
            <div className={styles.resultsToolbar}>
              <div className={styles.sortOptions}>
                <span>Sắp xếp:</span>
                <select className={styles.sortSelect}>
                  <option value="latest">Mới nhất</option>
                  <option value="price-low">Giá thấp → cao</option>
                  <option value="price-high">Giá cao → thấp</option>
                  <option value="rating">Đánh giá cao</option>
                </select>
              </div>
              <div className={styles.resultsCount}>
                Hiển thị {displayedTours.length} / {tours.length} tours
              </div>
            </div>

            {/* Hiển thị kết quả sau khi tìm kiếm */}
            <div className={styles.searchResults}>
              {loading && (
                <div className={styles.loading}>Đang tìm kiếm...</div>
              )}
              
              {!loading && hasSearched && tours.length === 0 && (
                <div className={styles.noResults}>
                  <h3>Không tìm thấy tour phù hợp</h3>
                  <p>Thử tìm kiếm với từ khóa hoặc bộ lọc khác</p>
                </div>
              )}
              
              {!loading && displayedTours.length > 0 && (
                <>
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
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}