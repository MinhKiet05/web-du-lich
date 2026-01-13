import React from 'react';
import styles from './BookedCard.module.css';

// Types
interface Billing {
  currency: string;
  discount_amount: number;
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  sub_total: number;
  total_amount: number;
}

interface LeadPassenger {
  full_name: string;
  identity_card: string;
  phone: string;
}

interface CustomerDetails {
  lead_passenger: LeadPassenger;
}

interface Participant {
  price_at_booking: number;
  qty: number;
  type: string;
}

interface SpecialRequest {
  k: string;
  v: string;
}

interface Metadata {
  created_at: string;
}

interface StatusHistory {
  note: string;
  status: string;
  updated_at: string;
}

interface TourSnapshot {
  base_price: number;
  departure_date: string;
  slug: string;
  tour_id: string;
  tour_name: string;
}

interface UserContext {
  display_name: string;
  email: string;
  uid: string;
}

interface Booking {
  id: string;
  billing: Billing;
  customer_details: CustomerDetails;
  participants: Participant[];
  special_requests: SpecialRequest[];
  metadata: Metadata;
  status_history: StatusHistory[];
  tour_snapshot: TourSnapshot;
  user_context: UserContext;
}

interface BookedCardProps {
  booking: Booking;
  onCardClick: (booking: Booking) => void;
  getTourImage: (tourId: string) => string;
  formatCurrency: (amount: number) => string;
  getParticipantsSummary: (participants: any[]) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}

const BookedCard: React.FC<BookedCardProps> = ({
  booking,
  onCardClick,
  getTourImage,
  formatCurrency,
  getParticipantsSummary,
  getStatusBadge,
}) => {
  const generateBookingCode = (bookingId: string) => {
    // Sử dụng document ID thực từ Firebase
    return `#${bookingId.toUpperCase()}`;
  };

  return (
    <div 
      className={styles.tourCard}
      onClick={() => onCardClick(booking)}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.tourImage}>
        <img
          src={getTourImage(booking.tour_snapshot?.tour_id || '')}
          alt={booking.tour_snapshot?.tour_name || 'Tour'}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/tour/default.svg';
          }}
        />
      </div>
      
      <div className={styles.tourInfo}>
        <div className={styles.bookingHeader}>
          <span className={styles.bookingCode}>
            Đơn hàng: {generateBookingCode(booking.id)}
          </span>
          <span className={styles.bookingDate}>
            Ngày đặt: {booking.metadata?.created_at ? new Date(booking.metadata.created_at).toLocaleDateString('vi-VN') : 'N/A'}
          </span>
        </div>
        
        <h3 className={styles.tourTitle}>{booking.tour_snapshot?.tour_name || 'Tên tour không có'}</h3>
        
        <div className={styles.tourMeta}>
          <span className={styles.tourPrice}>
            {formatCurrency(booking.billing?.total_amount || 0)}
          </span>
          <span className={styles.participants}>
            {getParticipantsSummary((booking.customer_details as any)?.participants || [])}
          </span>
        </div>
        
        <div className={styles.statusContainer}>
          {getStatusBadge(booking.billing?.payment_status || 'UNKNOWN')}
          <button 
            className={styles.detailButton}
            onClick={(e) => {
              e.stopPropagation();
              onCardClick(booking);
            }}
          >
            Xem chi tiết →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookedCard;