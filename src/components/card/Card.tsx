import styles from './Card.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faMoon, faLocationDot, faStar } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  // Tính số ngày và đêm từ type
  const getDaysNights = (type: string) => {
    // Parse định dạng mới: "3 ngày 2 đêm"
    const match = type.match(/(\d+)\s*ngày\s*(\d+)\s*đêm/i);
    if (match) {
      return {
        days: match[1],
        nights: match[2]
      };
    }
    return { days: '0', nights: '0' };
  };

  // Lấy địa điểm từ specs
  const getLocation = (specs: Array<{ k: string; v: string }>) => {
    const locationSpec = specs.find(spec => spec.k === 'location_end');
    return locationSpec ? locationSpec.v : 'Việt Nam';
  };

  const { nights, days } = getDaysNights(tour.type);
  const location = getLocation(tour.specs);

  const handleCardClick = () => {
    navigate(`/tour/${tour._id}`);
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
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
        <p className={styles.cardLocation}>{tour.rating_summary ? `${tour.rating_summary.average}` : 'Mới'}<FontAwesomeIcon icon={faStar} style={{color: "#FFD43B", marginLeft: "4px"}} /></p>
        
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
            <span>{location}</span>
          </div>
        </div>
        
        <div className={styles.cardFooter}>
          <div className={styles.priceSection}>
            <span className={styles.priceLabel}>Giá từ</span>
            <span className={styles.price}>{tour.price.display}</span>
          </div>
        </div>
      </div>
    </div>
  );
}