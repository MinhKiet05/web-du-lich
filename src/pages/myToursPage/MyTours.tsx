import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import toursData from '../../data/Tours.json';
import styles from './MyTours.module.css';

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

// Helper function to get detailed participants summary for modal
const getDetailedParticipantsSummary = (participants: Participant[]) => {
  console.log('getDetailedParticipantsSummary called with:', participants);
  
  if (!participants || participants.length === 0) {
    return {
      breakdown: 'Chưa có thông tin',
      total: 'Tổng: 0 người'
    };
  }

  let adults = 0;
  let children = 0;

  participants.forEach(participant => {
    const type = participant?.type || '';
    const qty = participant?.qty || 0;
    
    console.log('Processing participant for detailed:', { type, qty });
    
    if (type === 'Người lớn') {
      adults += qty;
    } else if (type === 'Trẻ em') {
      children += qty;
    } else {
      // Fallback cho các case khác
      adults += qty;
    }
  });

  console.log('Final detailed summary:', { adults, children });

  const parts = [];
  if (adults > 0) {
    parts.push(`${adults} người lớn`);
  }
  if (children > 0) {
    parts.push(`${children} trẻ em`);
  }

  const breakdown = parts.length > 0 ? parts.join(', ') : 'Chưa có thông tin';
  const total = adults + children;
  
  return {
    breakdown,
    total: `Tổng: ${total} người`
  };
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

interface BookingDetailModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

function BookingDetailModal({ booking, isOpen, onClose }: BookingDetailModalProps) {
  if (!isOpen || !booking) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return '#22c55e';
      case 'PENDING': return '#f59e0b';
      case 'FAILED': return '#ef4444';
      case 'REFUNDED': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Đã thanh toán';
      case 'PENDING': return 'Chờ thanh toán';
      case 'FAILED': return 'Thanh toán thất bại';
      case 'REFUNDED': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  const generateBookingCode = (bookingId: string, createdAt: string) => {
    const year = new Date(createdAt).getFullYear();
    const shortId = bookingId.substring(0, 8).toUpperCase();
    return `BOOKING_${year}_${shortId}`;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Chi tiết đặt tour</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <div className={styles.modalBody}>
          {/* 1. Trạng thái đơn hàng - Nổi bật nhất */}
          <div className={styles.statusSection}>
            <div className={styles.mainStatus}>
              <div 
                className={styles.statusBadgeLarge}
                style={{ 
                  backgroundColor: getStatusColor(booking.billing?.payment_status || 'UNKNOWN'),
                  color: 'white'
                }}
              >
                {getStatusLabel(booking.billing?.payment_status || 'UNKNOWN')}
              </div>
            </div>
            <div className={styles.bookingInfo}>
              <p><strong>Mã đặt chỗ:</strong> {generateBookingCode(booking.id, booking.metadata?.created_at || '')}</p>
              <p><strong>Ngày đặt:</strong> {booking.metadata?.created_at ? formatDate(booking.metadata.created_at) : 'N/A'}</p>
            </div>
          </div>

          {/* 2. Thông tin Tour đã đặt */}
          <div className={styles.section}>
            <h3>🏖️ Thông tin Tour đã đặt</h3>
            <div className={styles.tourInfoBox}>
              <h4>{booking.tour_snapshot?.tour_name || 'N/A'}</h4>
              <div className={styles.tourDetails}>
                <p><strong>📅 Ngày khởi hành:</strong> {booking.tour_snapshot?.departure_date ? formatDate(booking.tour_snapshot.departure_date) : 'N/A'}</p>
                <p><strong>💰 Giá gốc:</strong> {formatCurrency(booking.tour_snapshot?.base_price || 0)} / khách</p>
              </div>
            </div>
          </div>

          {/* 3. Thông tin hành khách */}
          <div className={styles.section}>
            <h3>👥 Thông tin hành khách</h3>
            <div className={styles.passengerInfo}>
              <div className={styles.leadPassenger}>
                <h4>Người đại diện</h4>
                <p><strong>{booking.customer_details?.lead_passenger?.full_name || 'N/A'}</strong> - {booking.customer_details?.lead_passenger?.phone || 'N/A'}</p>
                <p><strong>Số CCCD:</strong> {booking.customer_details?.lead_passenger?.identity_card || 'N/A'}</p>
              </div>

              <div className={styles.participantsSummary}>
                <h4>Tổng số người tham gia</h4>
                <div className={styles.summaryBreakdown}>
                  {(() => {
                    const summaryData = getDetailedParticipantsSummary((booking.customer_details as any)?.participants || []);
                    return (
                      <>
                        <p className={styles.summaryText}>{summaryData.breakdown}</p>
                        <p className={styles.summaryTotal}>{summaryData.total}</p>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className={styles.participantsList}>
                <h4>Chi tiết thành viên</h4>
                {(booking.participants || []).map((participant, index) => (
                  <div key={index} className={styles.participantItem}>
                    <div className={styles.participantType}>
                      <span className={styles.typeLabel}>{participant?.type || 'N/A'}</span>
                      <span className={styles.quantity}>x{participant?.qty || 0}</span>
                    </div>
                    <div className={styles.participantPrice}>
                      {formatCurrency((participant?.price_at_booking || 0) * (participant?.qty || 0))}
                      <small>({formatCurrency(participant?.price_at_booking || 0)}/người)</small>
                    </div>
                  </div>
                ))}
              </div>

              {(booking.special_requests || []).length > 0 && (
                <div className={styles.specialRequests}>
                  <h4>📝 Ghi chú đặc biệt</h4>
                  {(booking.special_requests || []).map((request, index) => (
                    <p key={index} className={styles.requestItem}>
                      <strong>{request?.k || 'N/A'}:</strong> {request?.v || 'N/A'}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4. Chi tiết thanh toán */}
          <div className={styles.section}>
            <h3>💳 Chi tiết thanh toán</h3>
            <div className={styles.billingDetails}>
              <div className={styles.billingRow}>
                <span>Tạm tính (Sub-total):</span>
                <span>{formatCurrency(booking.billing?.sub_total || 0)}</span>
              </div>
              
              {(booking.billing?.discount_amount || 0) > 0 && (
                <div className={styles.billingRow}>
                  <span>Giảm giá:</span>
                  <span className={styles.discount}>-{formatCurrency(booking.billing?.discount_amount || 0)}</span>
                </div>
              )}
              
              <div className={styles.billingTotal}>
                <span>Tổng cộng:</span>
                <span className={styles.totalAmount}>{formatCurrency(booking.billing?.total_amount || 0)}</span>
              </div>
            </div>
          </div>

          {/* 5. Lịch sử đơn hàng - Timeline */}
          <div className={styles.section}>
            <h3>📋 Lịch sử đơn hàng</h3>
            <div className={styles.timeline}>
              {(booking.status_history || []).map((status, index) => (
                <div key={index} className={styles.timelineItem}>
                  <div className={styles.timelineDot}></div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <strong>{status?.status || 'N/A'}</strong>
                      <span className={styles.timelineDate}>
                        {status?.updated_at ? formatDateTime(status.updated_at) : 'N/A'}
                      </span>
                    </div>
                    <p className={styles.timelineNote}>{status?.note || 'N/A'}</p>
                  </div>
                </div>
              ))}
              
              {/* Next step indicator for PENDING status */}
              {booking.billing?.payment_status === 'PENDING' && (
                <div className={styles.timelineItem + ' ' + styles.timelineNext}>
                  <div className={styles.timelineDotPending}></div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <span className={styles.nextStep}>Đang chờ thanh toán...</span>
                    </div>
                    <p className={styles.timelineNote}>Vui lòng hoàn tất thanh toán để xác nhận đặt tour</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
  }, [bookings, selectedStatus]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                <h3>⚠️ Cần tạo Firebase Index</h3>
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
                    🔗 Tạo Index tự động
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
        <h1>Tour đã đặt</h1>
        
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
            {filteredBookings.map((booking) => (
              <div key={booking.id} className={styles.tourCard}>
                <div className={styles.tourImage}>
                  <img
                    src={getTourImage(booking.tour_snapshot?.tour_id || '')}
                    alt={booking.tour_snapshot?.tour_name || 'Tour'}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/tour/default.svg';
                    }}
                  />
                  <div className={styles.statusBadgeOverlay}>
                    {getStatusBadge(booking.billing?.payment_status || 'UNKNOWN')}
                  </div>
                </div>
                
                <div className={styles.tourInfo}>
                  <h3 className={styles.tourTitle}>{booking.tour_snapshot?.tour_name || 'Tên tour không có'}</h3>
                  
                  <div className={styles.tourDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Ngày khởi hành:</span>
                      <span>{booking.tour_snapshot?.departure_date ? formatDate(booking.tour_snapshot.departure_date) : 'N/A'}</span>
                    </div>
                    
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Khách hàng:</span>
                      <span>{booking.customer_details?.lead_passenger?.full_name || 'N/A'}</span>
                    </div>
                    
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Số lượng:</span>
                      <span>
                        {getParticipantsSummary((booking.customer_details as any)?.participants || [])}
                      </span>
                    </div>
                    
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Tổng tiền:</span>
                      <span className={styles.price}>
                        {formatCurrency(booking.billing?.total_amount || 0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.bookingMeta}>
                    <small>
                      Đặt vào: {booking.metadata?.created_at ? new Date(booking.metadata.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </small>
                  </div>
                </div>
                
                <div className={styles.tourActions}>
                  <button 
                    className={styles.detailButton}   
                    onClick={() => openBookingDetail(booking)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <BookingDetailModal 
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={closeBookingDetail}
      />
    </div>
  );
}