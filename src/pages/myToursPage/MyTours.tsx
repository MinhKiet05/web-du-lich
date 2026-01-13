import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import toursData from '../../data/Tours.json';
import styles from './MyTours.module.css';
import BookedCard from '../../components/bookedCard/BookedCard';
import ModalBookedTour from '../../components/modalBookedTour/ModalBookedTour';

// Helper function to summarize participants
const getParticipantsSummary = (participants: Participant[]) => {
  if (!participants || participants.length === 0) {
    return 'Chưa có thông tin';
  }

  let adults = 0;
  let children = 0;

  participants.forEach(participant => {
    const type = participant?.type || '';
    const qty = participant?.qty || 0;
    
    if (type === 'Người lớn') {
      adults += qty;
    } else if (type === 'Trẻ em') {
      children += qty;
    } else {
      // Fallback cho các case khác
      adults += qty;
    }
  });

  const parts = [];
  if (adults > 0) {
    parts.push(`${adults} người lớn`);
  }
  if (children > 0) {
    parts.push(`${children} trẻ em`);
  }

  return parts.length > 0 ? parts.join(', ') : 'Chưa có thông tin';
};

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

interface Tour {
  _id: string;
  name: string;
  images: Array<{ url: string; caption: string }>;
}

export default function MyTours() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<string>('checking');
  const [displayCount, setDisplayCount] = useState(5);

  // Check Firebase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      setFirebaseStatus('connected');
    };
    
    checkConnection();
  }, []);

  const statusOptions = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ thanh toán' },
    { value: 'PAID', label: 'Đã thanh toán' },
    { value: 'FAILED', label: 'Thanh toán thất bại' },
    { value: 'REFUNDED', label: 'Đã hoàn tiền' }
  ];

  // Sample data for development/testing
  const setSampleData = () => {
    const sampleBookings: Booking[] = [
      {
        id: 'sample_booking_001',
        billing: {
          currency: 'VND',
          discount_amount: 0,
          payment_status: 'PENDING',
          sub_total: 116700000,
          total_amount: 116700000
        },
        customer_details: {
          lead_passenger: {
            full_name: 'Trần Minh Kiệt',
            identity_card: '67890',
            phone: '0123456789'
          }
        },
        participants: [
          {
            price_at_booking: 38900000,
            qty: 3,
            type: 'Người lớn'
          }
        ],
        special_requests: [
          {
            k: 'note',
            v: 'Yêu cầu phòng view biển'
          }
        ],
        metadata: {
          created_at: '2026-01-07T17:07:19.813Z'
        },
        status_history: [
          {
            note: 'Người dùng tạo đơn từ website',
            status: 'BOOKED',
            updated_at: '2026-01-07T17:07:19.813Z'
          }
        ],
        tour_snapshot: {
          base_price: 38900000,
          departure_date: '2026-03-07T18:00:00Z',
          slug: 'tour-dubai-abu-dhabi-5n4d',
          tour_id: 'tour_int_dubai_5n4d_013',
          tour_name: 'Tour Dubai - Abu Dhabi: Trải Nghiệm Xa Hoa 5 ngày 4 đêm'
        },
        user_context: {
          display_name: 'Minh Kiệt',
          email: 'thminhkiet05@gmail.com',
          uid: currentUser?.uid || 'sample_uid'
        }
      }
    ];
    
    setBookings(sampleBookings);
    console.log('Sample data loaded');
  };

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    // Trigger useEffect by changing a dependency
    window.location.reload();
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) {
      console.warn('❌ No current user found');
      setLoading(false);
      return;
    }

    try {
      setError(null); // Reset error state
      
      const bookingsRef = collection(db, 'bookings');
      
      // First try with orderBy (requires composite index)
      let querySnapshot;
      let bookingsData: Booking[] = [];
        
        try {
          const qWithOrder = query(
            bookingsRef,
            where('user_context.uid', '==', currentUser.uid),
            orderBy('metadata.created_at', 'desc')
          );
          
          querySnapshot = await getDocs(qWithOrder);
          
        } catch (indexError: any) {
          
          // Fallback to simple query without orderBy
          const qSimple = query(
            bookingsRef,
            where('user_context.uid', '==', currentUser.uid)
          );
          
          querySnapshot = await getDocs(qSimple);
        }
        
        
        if (querySnapshot.empty) {
          // No documents found
        }
        
        querySnapshot.forEach((doc) => {
          try {
            const data = doc.data();
            
            // Validate required fields
            if (data.billing && data.customer_details && data.tour_snapshot && data.user_context) {
              bookingsData.push({
                id: doc.id,
                ...data
              } as Booking);
            }
          } catch (docError) {
            // Silent error handling
          }
        });
        
        // Always sort manually to ensure proper order
        bookingsData.sort((a, b) => {
          const dateA = new Date(a.metadata.created_at).getTime();
          const dateB = new Date(b.metadata.created_at).getTime();
          return dateB - dateA; // Descending order (newest first)
        });
        
        setBookings(bookingsData);
        
      } catch (err: any) {
        
        // Provide more specific error messages
        let errorMessage = 'Không thể tải dữ liệu đặt tour';
        
        if (err.code === 'failed-precondition' || err.message.includes('index')) {
          errorMessage = 'Database index chưa được tạo. Đang sử dụng dữ liệu mẫu cho development.';
        } else if (err.code === 'permission-denied') {
          errorMessage = 'Không có quyền truy cập dữ liệu. Vui lòng đăng nhập lại.';
        } else if (err.code === 'unavailable') {
          errorMessage = 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
        } else if (err.message) {
          errorMessage = `Lỗi: ${err.message}`;
        }
        
        setError(errorMessage);
        
        // For development: Always show sample data when there's an error
        console.log('Adding sample data for development...');
        setSampleData();
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

  useEffect(() => {
    if (selectedStatus === 'ALL') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(
        bookings.filter(booking => booking.billing.payment_status === selectedStatus)
      );
    }
    // Reset display count when filters change
    setDisplayCount(5);
  }, [bookings, selectedStatus]);

  const handleLoadMore = () => {
    setDisplayCount(prevCount => prevCount + 5);
  };

  const getTourImage = (tourId: string): string => {
    const tour = toursData.find(t => t._id === tourId) as Tour | undefined;
    return tour?.images[0]?.url || '/images/tour/default.svg';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Chờ thanh toán', className: styles.statusPending },
      PAID: { label: 'Đã thanh toán', className: styles.statusPaid },
      FAILED: { label: 'Thất bại', className: styles.statusFailed },
      REFUNDED: { label: 'Đã hoàn tiền', className: styles.statusRefunded }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, className: styles.statusDefault };
    
    return <span className={`${styles.statusBadge} ${config.className}`}>{config.label}</span>;
  };

  const openBookingDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeBookingDetail = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
  };

  if (!currentUser) {
    return (
      <div className={styles.myToursPage}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <h1>Vui lòng đăng nhập</h1>
            <p>Bạn cần đăng nhập để xem danh sách tour đã đặt.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.myToursPage}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <h1>Đang tải...</h1>
            <p>Vui lòng đợi trong giây lát...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isIndexError = error.includes('index') || error.includes('Database index');
    
    return (
      <div className={styles.myToursPage}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h1>Có lỗi xảy ra</h1>
            <p>{error}</p>
            
            {isIndexError && (
              <div className={styles.indexWarning}>
                <h3>Cần tạo Firebase Index</h3>
                <p>Để query hoạt động tối ưu, hãy tạo composite index cho Firestore:</p>
                <div className={styles.indexInstructions}>
                  <p><strong>Collection:</strong> bookings</p>
                  <p><strong>Fields:</strong></p>
                  <ul>
                    <li>user_context.uid (Ascending)</li>
                    <li>metadata.created_at (Descending)</li>
                  </ul>
                  <a 
                    href="https://console.firebase.google.com/v1/r/project/web-du-lich-100e5/firestore/indexes?create_composite=ClJwcm9qZWN0cy93ZWItZHUtbGljaC0xMDBlNS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvYm9va2luZ3MvaW5kZXhlcy9fEAEaFAoQdXNlcl9jb250ZXh0LnVpZBABGhcKE21ldGFkYXRhLmNyZWF0ZWRfYXQQAhoMCghfX25hbWVfXxAC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.indexLink}
                  >
                    Tạo Index tự động
                  </a>
                </div>
              </div>
            )}
            
            <div className={styles.errorActions}>
              <button 
                className={styles.retryButton}
                onClick={retryFetch}
              >
                Thử lại
              </button>
            </div>
            <details className={styles.debugInfo}>
              <summary>Thông tin debug</summary>
              <div>
                <p><strong>User ID:</strong> {currentUser?.uid || 'N/A'}</p>
                <p><strong>Email:</strong> {currentUser?.email || 'N/A'}</p>
                <p><strong>Firebase Status:</strong> 
                  <span style={{ 
                    color: firebaseStatus === 'connected' ? '#10b981' : firebaseStatus === 'disconnected' ? '#ef4444' : '#f59e0b',
                    fontWeight: 'bold'
                  }}>
                    {firebaseStatus}
                  </span>
                </p>
                <p><strong>Firebase Project:</strong> {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'N/A'}</p>
                <p><strong>Environment:</strong> Development</p>
                <p><strong>Current Time:</strong> {new Date().toISOString()}</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.myToursPage}>
      <div className={styles.container}>
        
        {/* Filter Section */}
        <div className={styles.filterSection}>
          <div className={styles.filterRow}>
            <label htmlFor="status-filter">Lọc theo trạng thái:</label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={styles.filterSelect}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.resultsCount}>
            Tìm thấy {filteredBookings.length} đặt tour
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <h2>Chưa có tour nào được đặt</h2>
            <p>Bạn chưa đặt tour nào. Hãy khám phá các tour du lịch hấp dẫn của chúng tôi!</p>
          </div>
        ) : (
          <div className={styles.toursList}>
            {filteredBookings.slice(0, displayCount).map((booking) => (
              <BookedCard
                key={booking.id}
                booking={booking}
                onCardClick={openBookingDetail}
                getTourImage={getTourImage}
                formatCurrency={formatCurrency}
                getParticipantsSummary={getParticipantsSummary}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredBookings.length > displayCount && (
          <div className={styles.loadMoreContainer}>
            <button 
              className={styles.loadMoreButton}
              onClick={handleLoadMore}
            >
              Xem thêm 
            </button>
          </div>
        )}
      </div>
      
      <ModalBookedTour 
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={closeBookingDetail}
      />
    </div>
  );
}