import React from 'react';
import styles from './ModalBookedTour.module.css';
import QRPayment from '../qrPayment/QRPayment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUmbrellaBeach, 
  faUsers, 
  faCalendarDays, 
  faMoneyBills, 
  faUser,
  faPhone, 
  faIdCard, 
  faMoneyBill, 
  faTag, 
  faReceipt, 
  faClipboardList, 
  faCheck, 
  faClock, 
  faLightbulb, 
    faSearch,
    faNoteSticky
} from '@fortawesome/free-solid-svg-icons';

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

interface ModalBookedTourProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

const ModalBookedTour: React.FC<ModalBookedTourProps> = ({
  booking,
  isOpen,
  onClose
}) => {
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

  const generateBookingCode = (bookingId: string) => {
    // Sử dụng document ID thực từ Firebase
    return `#${bookingId.toUpperCase()}`;
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
                  color: getStatusColor(booking.billing?.payment_status || 'UNKNOWN'),
                }}
              >
                {getStatusLabel(booking.billing?.payment_status || 'UNKNOWN')}
              </div>
            </div>
            <div className={styles.bookingInfo}>
              <p><strong>Mã đặt chỗ:</strong> {generateBookingCode(booking.id)}</p>
              <p><strong>Ngày đặt:</strong> {booking.metadata?.created_at ? formatDate(booking.metadata.created_at) : 'N/A'}</p>
              <p><strong>Tổng tiền:</strong> <span className={styles.totalHighlight}>{formatCurrency(booking.billing?.total_amount || 0)}</span></p>
            </div>
          </div>

          {/* QR Payment Section cho trạng thái PENDING */}
          

          {/* 2. Thông tin Tour đã đặt */}
          <div className={styles.section}>
            <h3><FontAwesomeIcon icon={faUmbrellaBeach} /> Thông tin Tour đã đặt</h3>
            <div className={styles.tourInfoBox}>
              <h4>{booking.tour_snapshot?.tour_name || 'N/A'}</h4>
              <div className={styles.tourDetailsGrid}>
                <div className={styles.tourDetailItem}>
                  <span className={styles.detailIcon}><FontAwesomeIcon icon={faCalendarDays} /></span>
                  <div>
                    <span className={styles.detailLabel}>Ngày khởi hành</span>
                    <span className={styles.detailValue}>{booking.tour_snapshot?.departure_date ? formatDate(booking.tour_snapshot.departure_date) : 'N/A'}</span>
                  </div>
                </div>
                <div className={styles.tourDetailItem}>
                  <span className={styles.detailIcon}><FontAwesomeIcon icon={faMoneyBills} /></span>
                  <div>
                    <span className={styles.detailLabel}>Giá gốc</span>
                    <span className={styles.detailValue}>{formatCurrency(booking.tour_snapshot?.base_price || 0)} / khách</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Thông tin hành khách */}
          <div className={styles.section}>
            <h3><FontAwesomeIcon icon={faUsers} /> Thông tin hành khách</h3>
            <div className={styles.passengerInfo}>
              <div className={styles.leadPassenger}>
                <div className={styles.passengerHeader}>
                  <h4><FontAwesomeIcon icon={faUser} /> Người đại diện</h4>
                </div>
                <div className={styles.passengerDetails}>
                  <div className={styles.passengerDetailItem}>
                    <span className={styles.detailIcon}><FontAwesomeIcon icon={faUser} /></span>
                    <div>
                      <span className={styles.detailLabel}>Họ tên</span>
                      <span className={styles.detailValue}>{booking.customer_details?.lead_passenger?.full_name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className={styles.passengerDetailItem}>
                    <span className={styles.detailIcon}><FontAwesomeIcon icon={faPhone} /></span>
                    <div>
                      <span className={styles.detailLabel}>Điện thoại</span>
                      <span className={styles.detailValue}>{booking.customer_details?.lead_passenger?.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div className={styles.passengerDetailItem}>
                    <span className={styles.detailIcon}><FontAwesomeIcon icon={faIdCard} /></span>
                    <div>
                      <span className={styles.detailLabel}>CCCD</span>
                      <span className={styles.detailValue}>{booking.customer_details?.lead_passenger?.identity_card || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.participantsSummary}>
                <div className={styles.passengerHeader}>
                  <h4><FontAwesomeIcon icon={faUsers} /> Tổng số người tham gia</h4>
                </div>
                <div className={styles.participantsList}>
                  {(() => {
                    const participants = (booking.customer_details as any)?.participants || [];
                    const adults = participants.find((p: any) => p.type === 'Người lớn')?.qty || 0;
                    const children = participants.find((p: any) => p.type === 'Trẻ em')?.qty || 0;
                    const total = adults + children;
                    
                    return (
                      <>
                        {adults > 0 && (
                          <div className={styles.participantItem}>
                            <div className={styles.participantType}>
                              <span className={styles.typeLabel}>Người lớn</span>
                            </div>
                            <div className={styles.participantQuantity}>
                              <span>x{adults}</span>
                            </div>
                          </div>
                        )}
                        {children > 0 && (
                          <div className={styles.participantItem}>
                            <div className={styles.participantType}>
                              <span className={styles.typeLabel}>Trẻ em</span>
                            </div>
                            <div className={styles.participantQuantity}>
                              <span>x{children}</span>
                            </div>
                          </div>
                        )}
                        <div className={styles.participantTotal}>
                          <div className={styles.participantType}>
                            <span className={styles.totalLabel}>Tổng cộng</span>
                          </div>
                          <div className={styles.participantQuantity}>
                            <span className={styles.totalValue}>
                              {total} người
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              

              <div className={styles.specialRequests}>
                <h4><FontAwesomeIcon icon={faNoteSticky} /> Ghi chú đặc biệt</h4>
                {((booking.customer_details as any)?.special_requests || []).length > 0 ? (
                  ((booking.customer_details as any)?.special_requests || []).map((request: any, index: number) => (
                    <p key={index} className={styles.requestItem}>
                      {request?.v || 'N/A'}
                    </p>
                  ))
                ) : (
                  <p className={styles.requestItem}>Không có ghi chú đặc biệt</p>
                )}
              </div>
            </div>
          </div>

          {/* 4. Chi tiết thanh toán */}
          <div className={styles.section}>
            <h3><FontAwesomeIcon icon={faMoneyBills} /> Chi tiết thanh toán</h3>
            <div className={styles.billingDetails}>
              <div className={styles.billingHeader}>
                <h4><FontAwesomeIcon icon={faReceipt} /> Thông tin thanh toán</h4>
              </div>
              
              <div className={styles.billingRow}>
                <div className={styles.billingItem}>
                  <span className={styles.detailIcon}><FontAwesomeIcon icon={faMoneyBill} /> Chi phí Tour</span>
                  <div>
                    <span className={styles.detailValue}>{formatCurrency(booking.billing?.sub_total || 0)}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.billingRow}>
                <div className={styles.billingItem}>
                  <span className={styles.detailIcon}><FontAwesomeIcon icon={faTag} /> Giảm giá</span>
                  <div>
                    <span className={`${styles.detailValue} ${styles.discount}`}>
                      {(booking.billing?.discount_amount || 0) > 0 
                        ? `-${formatCurrency(booking.billing?.discount_amount || 0)}` 
                        : `${formatCurrency(0)}`
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={styles.billingTotal}>
                <div className={styles.totalItem}>
                  <span className={styles.detailIcon}><FontAwesomeIcon icon={faReceipt} /> Tổng cộng</span>
                  <div>
                    <span className={styles.totalAmount}>{formatCurrency(booking.billing?.total_amount || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Lịch sử đơn hàng - Timeline */}
          <div className={styles.section}>
            <h3><FontAwesomeIcon icon={faClipboardList} /> Lịch sử đơn hàng</h3>
            <div className={styles.timeline}>
              {(booking.status_history || []).map((status, index) => (
                <div key={index} className={styles.timelineItem}>
                  <div className={styles.timelineDot}></div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <strong><FontAwesomeIcon icon={faCheck} /> {status?.status || 'N/A'}</strong>
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
                      <span className={styles.nextStep}><FontAwesomeIcon icon={faClock} /> Đang chờ thanh toán...</span>
                    </div>
                    <p className={styles.timelineNote}>
                      <FontAwesomeIcon icon={faLightbulb} /> <strong>Vui lòng hoàn tất thanh toán để xác nhận đặt tour</strong><br/>
                      <FontAwesomeIcon icon={faSearch} /> Mã đơn hàng: {generateBookingCode(booking.id)}
                    </p>
                  </div>
                </div>
              )}
            </div>
                  </div>
                  {booking.billing?.payment_status === 'PENDING' && (
            <div className={styles.qrPaymentSection}>
              <div className={styles.qrPaymentContent}>
                <QRPayment
                  amount={booking.billing?.total_amount || 0}
                  orderId={generateBookingCode(booking.id)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalBookedTour;