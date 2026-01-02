import styles from './Card.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faMoon, faLocationDot } from '@fortawesome/free-solid-svg-icons';

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
  specs: Array<{
    k: string;
    v: string;
  }>;
  images: Array<{
    url: string;
    caption: string;
  }>;
}

interface CardProps {
  tour: Tour;
}

export default function Card({ tour }: CardProps) {
  // Tính số ngày và đêm từ type
  const getDaysNights = (type: string) => {
    const match = type.match(/(\d+)N(\d+)Đ/);
    if (match) {
      return {
        nights: match[1],
        days: match[2]
      };
    }
    return { nights: '0', days: '0' };
  };

  // Lấy địa điểm từ specs
  const getLocation = (specs: Array<{ k: string; v: string }>) => {
    const locationSpec = specs.find(spec => spec.k === 'location_end');
    return locationSpec ? locationSpec.v : 'Việt Nam';
  };

  const { nights, days } = getDaysNights(tour.type);
  const location = getLocation(tour.specs);

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={tour.images[0]?.url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop'}
          alt={tour.name}
          className={styles.cardImage}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop';
          }}
        />
      </div>
      
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{tour.short_name}</h3>
        <p className={styles.cardLocation}>Địa điểm: {location}</p>
        
        <div className={styles.divider}></div>
        
        <div className={styles.cardInfo}>
          <div className={styles.infoItem}>
            <FontAwesomeIcon icon={faCalendarDays} className={styles.infoIcon} />
            <span>{days} Ngày</span>
          </div>
          <div className={styles.infoItem}>
            <FontAwesomeIcon icon={faMoon} className={styles.infoIcon} />
            <span>{nights} Đêm</span>
          </div>
          <div className={styles.infoItem}>
            <FontAwesomeIcon icon={faLocationDot} className={styles.infoIcon} />
            <span>{tour.rating_summary ? `${tour.rating_summary.average}⭐` : 'Mới'}</span>
          </div>
        </div>
        
        <div className={styles.cardFooter}>
          <div className={styles.priceSection}>
            <span className={styles.priceLabel}>Giá từ</span>
            <span className={styles.price}>{tour.price.display}</span>
          </div>
          <button className={styles.viewTourButton}>Xem Chi Tiết</button>
        </div>
      </div>
    </div>
  );
}