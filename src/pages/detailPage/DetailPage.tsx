import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faMoon, faLocationDot, faStar, faUsers, faClock, faRoute, faCar, faHotel } from '@fortawesome/free-solid-svg-icons';
import { getTourByIdFromFirebase } from '../../utils/firebaseHelpers';
import styles from './DetailPage.module.css';

interface Tour {
  _id: string;
  name: string;
  short_name: string;
  slug: string;
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
  recurring_schedule?: string[];
  specs: Array<{
    k: string;
    v: string;
  }>;
  pickup_location: {
    location_id: string;
    name: string;
    address: string;
    coordinates: number[];
  };
  itinerary: Array<{
    day_label: string;
    title: string;
    details: string;
  }>;
  policy: {
    included: string[];
    excluded: string[];
  };
  images: Array<{
    url: string;
    caption: string;
  }>;
}

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTourData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Lấy dữ liệu từ Firebase
        const tourData = await getTourByIdFromFirebase(id);
        
        if (tourData) {
          setTour(tourData);
        } else {
          console.log('No tour found with ID:', id);
          setTour(null);
        }
      } catch (error) {
        console.error('Error loading tour from Firebase:', error);
        setTour(null);
      } finally {
        setLoading(false);
      }
    };

    loadTourData();
    // Cuộn lên đầu trang khi component mount
    window.scrollTo(0, 0);
  }, [id]);

  // Helper functions
  const getDaysNights = (type: string) => {
    // Parse định dạng mới: "3 ngày 2 đêm"
    const match = type.match(/(\d+)\s*ngày\s*(\d+)\s*đêm/i);
    if (match) {
      return { days: match[1], nights: match[2] };
    }
    return { days: '0', nights: '0' };
  };

  const getSpecValue = (specs: Array<{k: string; v: string}>, key: string) => {
    const spec = specs.find(s => s.k === key);
    return spec ? spec.v : '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.container}>
          <div className={styles.loading}>Đang tải thông tin tour...</div>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>Không tìm thấy tour</h2>
          </div>
        </div>
      </div>
    );
  }

  const { nights, days } = getDaysNights(tour.type);

  return (
    <div className={styles.detailPage}>
      <div className={styles.container}>
        
        <div className={styles.tourDetail}>
          <div className={styles.imageSection}>
            <img 
              src={tour.images[0]?.url} 
              alt={tour.name}
              className={styles.mainImage}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop';
              }}
            />
            <div className={styles.imageCaption}>
              {tour.images[0]?.caption}
            </div>
          </div>
          
          <div className={styles.infoSection}>
            <h1 className={styles.tourTitle}>{tour.name}</h1>
            
            {tour.rating_summary && (
              <div className={styles.rating}>
                <span className={styles.ratingScore}>
                  {tour.rating_summary.average} <FontAwesomeIcon icon={faStar} style={{color: "#FFD43B"}} />
                </span>
                <span className={styles.ratingCount}>({tour.rating_summary.count} đánh giá)</span>
              </div>
            )}

            <div className={styles.tourMeta}>
              <div className={styles.metaItem}>
                <FontAwesomeIcon icon={faCalendarDays} className={styles.metaIcon} />
                <span>{days} Ngày</span>
              </div>
              <div className={styles.metaItem}>
                <FontAwesomeIcon icon={faMoon} className={styles.metaIcon} />
                <span>{nights} Đêm</span>
              </div>
              <div className={styles.metaItem}>
                <FontAwesomeIcon icon={faLocationDot} className={styles.metaIcon} />
                <span>{getSpecValue(tour.specs, 'location_end')}</span>
              </div>
            </div>
            
            <div className={styles.priceSection}>
              <span className={styles.priceLabel}>Giá tour:</span>
              <span className={styles.price}>{tour.price.display}</span>
            </div>
            
            <div className={styles.actions}>
              <button className={styles.bookButton}>Đặt tour ngay</button>
              <button className={styles.favoriteButton}>♡ Yêu thích</button>
            </div>
          </div>
        </div>

        {/* Tour Specifications */}
        <div className={styles.specsSection}>
          <h3>Thông tin tour</h3>
          <div className={styles.specsGrid}>
            <div className={styles.specItem}>
              <FontAwesomeIcon icon={faClock} className={styles.specIcon} />
              <span><strong>Thời gian:</strong> {tour.type}</span>
            </div>
            
            <div className={styles.specItem}>
              <FontAwesomeIcon icon={faRoute} className={styles.specIcon} />
              <span><strong>Lịch trình:</strong> {getSpecValue(tour.specs, 'location_start')} - {getSpecValue(tour.specs, 'location_end')}</span>
            </div>
            
            <div className={styles.specItem}>
              <FontAwesomeIcon icon={faCalendarDays} className={styles.specIcon} />
              <span><strong>Khởi hành:</strong> {tour.recurring_schedule ? tour.recurring_schedule.join(', ') : 'Liên hệ'}</span>
            </div>
            
            <div className={styles.specItem}>
              <FontAwesomeIcon icon={faCar} className={styles.specIcon} />
              <span><strong>Phương tiện:</strong> {getSpecValue(tour.specs, 'transport') || 'Liên hệ'}</span>
            </div>
            
            <div className={styles.specItem}>
              <FontAwesomeIcon icon={faHotel} className={styles.specIcon} />
              <span><strong>Khách sạn:</strong> {getSpecValue(tour.specs, 'hotel_rating') || 'Liên hệ'}</span>
            </div>
            
          </div>
        </div>

        {/* Pickup Location */}
        <div className={styles.pickupSection}>
          <h3>Điểm tập trung</h3>
          <div className={styles.pickupInfo}>
            <FontAwesomeIcon icon={faLocationDot} className={styles.pickupIcon} />
            <div>
              <strong>{tour.pickup_location.name}</strong>
              <p>{tour.pickup_location.address}</p>
            </div>
          </div>
        </div>

        {/* Upcoming Departures */}
        {tour.upcoming_departures && tour.upcoming_departures.length > 0 && (
          <div className={styles.departuresSection}>
            <h3>Lịch khởi hành</h3>
            <div className={styles.departuresGrid}>
              {tour.upcoming_departures.map((departure, index) => (
                <div key={index} className={styles.departureItem}>
                  <div className={styles.departureDate}>
                    {formatDate(departure.date)}
                  </div>
                  <div className={styles.departureDow}>
                    {departure.day_of_week}
                  </div>
                  <div className={styles.departureSeats}>
                    <FontAwesomeIcon icon={faUsers} />
                    {departure.seats_left} chỗ trống
                  </div>
                </div>
              ))}
            </div>
            {tour.recurring_schedule && (
              <p className={styles.recurringInfo}>
                Lịch trình: {tour.recurring_schedule.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Itinerary */}
        <div className={styles.itinerarySection}>
          <h3>Lịch trình tour</h3>
          <div className={styles.itineraryList}>
            {tour.itinerary.map((day, index) => (
              <div key={index} className={styles.itineraryItem}>
                <div className={styles.dayLabel}>{day.day_label}</div>
                <div className={styles.dayContent}>
                  <h4>{day.title}</h4>
                  <p>{day.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policy */}
        <div className={styles.policySection}>
          <h3>Chính sách tour</h3>
          <div className={styles.policyGrid}>
            <div className={styles.included}>
              <h4>Bao gồm</h4>
              <ul>
                {tour.policy.included.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={styles.excluded}>
              <h4>Không bao gồm</h4>
              <ul>
                {tour.policy.excluded.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}