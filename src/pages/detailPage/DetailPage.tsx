import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faMoon, faLocationDot, faStar, faClock, faRoute, faCar, faHotel, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getTourByIdFromFirebase } from '../../utils/firebaseHelpers';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import QRPayment from '../../components/qrPayment/QRPayment';
import styles from './DetailPage.module.css';
import modalStyles from './BookingModal.module.css';

interface Booking {
  user_context: {
    uid: string;
    email: string;
    display_name: string;
  };
  tour_snapshot: {
    tour_id: string;
    tour_name: string;
    departure_date: string;
    base_price: number;
    slug: string;
  };
  customer_details: {
    lead_passenger: {
      full_name: string;
      phone: string;
      identity_card: string;
    };
    participants: Array<{
      type: string;
      qty: number;
      price_at_booking: number;
    }>;
    special_requests: Array<{
      k: string;
      v: string;
    }>;
  };
  billing: {
    sub_total: number;
    discount_code?: string;
    discount_amount: number;
    total_amount: number;
    currency: string;
    payment_status: string;
  };
  status_history: Array<{
    status: string;
    updated_at: string;
    note: string;
  }>;
  metadata: {
    created_at: string;
  };
}

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
  const [selectedDeparture, setSelectedDeparture] = useState<{date: string; day_of_week: string; seats_left: number} | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [modalStep, setModalStep] = useState<'booking' | 'payment'>('booking');
  const [bookingId, setBookingId] = useState<string>('');
  const [bookingForm, setBookingForm] = useState({
    full_name: '',
    phone: '',
    identity_card: '',
    adults: 2,
    children: 0,
    special_requests: ''
  });
  const { currentUser, login } = useAuth();

  useEffect(() => {
    const loadTourData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Lấy dữ liệu từ Firebase
        const tourData = await getTourByIdFromFirebase(id);
        
        if (tourData) {
          setTour(tourData as Tour);
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

  const handleBookNow = async () => {
    if (!selectedDeparture) {
      alert('Vui lòng chọn ngày khởi hành');
      return;
    }

    if (!currentUser) {
      try {
        await login();
      } catch (error) {
        console.error('Login failed:', error);
        return;
      }
    }

    if (currentUser) {
      setModalStep('booking');
      setShowBookingModal(true);
    }
  };

  const calculateTotal = () => {
    if (!tour) return 0;
    const adultPrice = tour.price.amount;
    const childPrice = tour.price.amount * 0.5; // Giả sử trẻ em 50% giá người lớn
    return (bookingForm.adults * adultPrice) + (bookingForm.children * childPrice);
  };

  const handleSubmitBooking = async () => {
    if (!currentUser || !tour || !selectedDeparture) return;

    try {
      const booking: Booking = {
        user_context: {
          uid: currentUser.uid,
          email: currentUser.email || '',
          display_name: currentUser.displayName || bookingForm.full_name
        },
        tour_snapshot: {
          tour_id: tour._id,
          tour_name: tour.name,
          departure_date: selectedDeparture.date,
          base_price: tour.price.amount,
          slug: tour.slug
        },
        customer_details: {
          lead_passenger: {
            full_name: bookingForm.full_name,
            phone: bookingForm.phone,
            identity_card: bookingForm.identity_card
          },
          participants: [
            { type: 'Người lớn', qty: bookingForm.adults, price_at_booking: tour.price.amount },
            { type: 'Trẻ em', qty: bookingForm.children, price_at_booking: tour.price.amount * 0.5 }
          ].filter(p => p.qty > 0),
          special_requests: bookingForm.special_requests ? [{ k: 'note', v: bookingForm.special_requests }] : []
        },
        billing: {
          sub_total: calculateTotal(),
          discount_amount: 0,
          total_amount: calculateTotal(),
          currency: 'VND',
          payment_status: 'PENDING'
        },
        status_history: [{
          status: 'BOOKED',
          updated_at: new Date().toISOString(),
          note: 'Người dùng tạo đơn từ website'
        }],
        metadata: {
          created_at: new Date().toISOString()
        }
      };

      const docRef = await addDoc(collection(db, 'bookings'), booking);
      setBookingId(docRef.id);
      setModalStep('payment');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Có lỗi xảy ra khi đặt tour. Vui lòng thử lại.');
    }
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
            {tour.upcoming_departures && tour.upcoming_departures.length > 0 && (
          <div className={styles.departuresSection}>
            <div className={styles.departuresGrid}>
              {tour.upcoming_departures.map((departure, index) => (
                <div 
                  key={index} 
                  className={`${styles.departureItem} ${selectedDeparture?.date === departure.date ? styles.selected : ''}`}
                  onClick={() => setSelectedDeparture(departure)}
                >
                  <div className={styles.departureLeft}>
                    <div className={styles.departureDate}>
                      {formatDate(departure.date)}
                    </div>
                    <div className={styles.departureDow}>
                      {departure.day_of_week}
                    </div>
                  </div>
                  <div className={styles.departureRight}>
                    <div className={`${styles.departureStatus} ${departure.seats_left <= 6 ? styles.statusAlmostFull : styles.statusAvailable}`}>
                      {departure.seats_left <= 6 ? 'Sắp hết' : 'Đang nhận'}
                    </div>
                    <div className={styles.departureSeats}>
                      {departure.seats_left <= 6 
                        ? `Chỉ còn ${departure.seats_left} chỗ`
                        : `Còn ${departure.seats_left} chỗ trống`
                      }
                    </div>
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
            <div className={styles.actions}>
              <button 
                className={`${styles.bookButton} ${!selectedDeparture ? styles.disabled : ''}`}
                onClick={handleBookNow}
                disabled={!selectedDeparture}
              >
                {!selectedDeparture ? 'Chọn ngày khởi hành' : 'Đặt tour ngay'}
              </button>
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

        {/* Booking Modal */}
        {showBookingModal && (
          <div className={modalStyles.modalOverlay} onClick={() => {
            setShowBookingModal(false);
            setModalStep('booking');
          }}>
            <div className={modalStyles.bookingModal} onClick={(e) => e.stopPropagation()}>
              {modalStep === 'booking' ? (
                <>
                  <div className={modalStyles.modalHeader}>
                    <h3>Đặt Tour Du Lịch</h3>
                    <button 
                      className={modalStyles.closeButton}
                      onClick={() => {
                        setShowBookingModal(false);
                        setModalStep('booking');
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                  
                  <div className={modalStyles.modalContent}>
                    <div className={modalStyles.tourSummary}>
                      <img 
                        src={tour?.images[0]?.url} 
                        alt={tour?.name}
                        className={modalStyles.tourImage}
                      />
                      <div className={modalStyles.tourInfo}>
                        <h4>{tour?.name}</h4>
                        <p>{selectedDeparture && formatDate(selectedDeparture.date)} - {selectedDeparture?.day_of_week}</p>
                        <p className={modalStyles.tourPrice}>{tour?.price.display}</p>
                      </div>
                    </div>

                    <div className={modalStyles.formSection}>
                      <h4>Thông tin liên hệ</h4>
                      <div className={modalStyles.formGrid}>
                        <div className={modalStyles.formGroup}>
                          <label>Họ và tên *</label>
                          <input 
                            type="text"
                            value={bookingForm.full_name}
                            onChange={(e) => setBookingForm({...bookingForm, full_name: e.target.value})}
                            placeholder="Nguyễn Văn A"
                            required
                          />
                        </div>
                        <div className={modalStyles.formGroup}>
                          <label>Số điện thoại *</label>
                          <input 
                            type="tel"
                            value={bookingForm.phone}
                            onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                            placeholder="0901234567"
                            required
                          />
                        </div>
                        <div className={modalStyles.formGroup}>
                          <label>CCCD/CMND *</label>
                          <input 
                            type="text"
                            value={bookingForm.identity_card}
                            onChange={(e) => setBookingForm({...bookingForm, identity_card: e.target.value})}
                            placeholder="Số giấy tờ tùy thân"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className={modalStyles.formSection}>
                      <h4>Số lượng khách</h4>
                      <div className={modalStyles.participantGrid}>
                        <div className={modalStyles.participantItem}>
                          <div className={modalStyles.participantInfo}>
                            <span>Người lớn</span>
                            <span>Từ 12 tuổi trở lên</span>
                            <span className={modalStyles.price}>{tour?.price.display}</span>
                          </div>
                          <div className={modalStyles.quantityControl}>
                            <button 
                              type="button"
                              onClick={() => setBookingForm({...bookingForm, adults: Math.max(1, bookingForm.adults - 1)})}
                            >
                              -
                            </button>
                            <span>{bookingForm.adults}</span>
                            <button 
                              type="button"
                              onClick={() => setBookingForm({...bookingForm, adults: bookingForm.adults + 1})}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        <div className={modalStyles.participantItem}>
                          <div className={modalStyles.participantInfo}>
                            <span>Trẻ em</span>
                            <span>Từ 5 - 11 tuổi</span>
                            <span className={modalStyles.price}>{tour && `${(tour.price.amount * 0.5).toLocaleString('vi-VN')}đ`}</span>
                          </div>
                          <div className={modalStyles.quantityControl}>
                            <button 
                              type="button"
                              onClick={() => setBookingForm({...bookingForm, children: Math.max(0, bookingForm.children - 1)})}
                            >
                              -
                            </button>
                            <span>{bookingForm.children}</span>
                            <button 
                              type="button"
                              onClick={() => setBookingForm({...bookingForm, children: bookingForm.children + 1})}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={modalStyles.formSection}>
                      <h4>Yêu cầu đặc biệt</h4>
                      <textarea 
                        value={bookingForm.special_requests}
                        onChange={(e) => setBookingForm({...bookingForm, special_requests: e.target.value})}
                        placeholder="Ví dụ: Ăn chay, có người già di chuyển khó khăn..."
                        rows={3}
                      />
                    </div>

                    <div className={modalStyles.totalSection}>
                      <div className={modalStyles.totalRow}>
                        <span>Tổng cộng</span>
                        <span className={modalStyles.totalAmount}>
                          {calculateTotal().toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>

                    <div className={modalStyles.modalActions}>
                      <button 
                        className={modalStyles.confirmButton}
                        onClick={handleSubmitBooking}
                        disabled={!bookingForm.full_name || !bookingForm.phone || !bookingForm.identity_card}
                      >
                        Tiếp tục thanh toán ➜
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <QRPayment 
                  amount={calculateTotal()}
                  orderId={bookingId}
                  onClose={() => {
                    setShowBookingModal(false);
                    setModalStep('booking');
                    setBookingForm({
                      full_name: '',
                      phone: '',
                      identity_card: '',
                      adults: 2,
                      children: 0,
                      special_requests: ''
                    });
                    alert('Cảm ơn bạn đã đặt tour! Chúng tôi sẽ xác nhận đơn hàng sau khi nhận được thanh toán.');
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}