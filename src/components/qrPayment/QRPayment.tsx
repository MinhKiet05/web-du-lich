
import styles from './QRPayment.module.css';

interface QRPaymentProps {
  amount: number;
  orderId: string;
  onClose?: () => void;
}

export default function QRPayment({ amount, orderId, onClose }: QRPaymentProps) {
  const bank = "Sacombank";
  const account = "012345678";
  const accountName = "TRAN HUYNH MINH KIET";
  const transferContent = `Thanh toan don hang ${orderId}`;

  return (
    <div className={styles.qrContainer}>
      <div className={styles.header}>
        <h3>Quét mã QR để thanh toán</h3>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        )}
      </div>
      
      <div className={styles.qrImageContainer}>
        <img 
          src="/qrPayment.webp" 
          alt="QR thanh toán" 
          className={styles.qrImage}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/250x250/0891b2/ffffff?text=QR+Code';
          }}
        />
      </div>

      <div className={styles.paymentInfo}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Số tiền:</span>
          <span className={styles.value}>{amount.toLocaleString('vi-VN')} VND</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Mã đơn hàng:</span>
          <span className={styles.value}>{orderId}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Ngân hàng:</span>
          <span className={styles.value}>{bank}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Số tài khoản:</span>
          <span className={styles.value}>{account}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Chủ tài khoản:</span>
          <span className={styles.value}>{accountName}</span>
        </div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Nội dung chuyển khoản:</span>
          <span className={styles.value}>{transferContent}</span>
        </div>
      </div>

      <div className={styles.instructions}>
        <h4>Hướng dẫn thanh toán:</h4>
        <ol>
          <li>Mở ứng dụng banking trên điện thoại</li>
          <li>Quét mã QR hoặc chuyển khoản theo thông tin trên</li>
          <li>Nhập đúng nội dung chuyển khoản</li>
          <li>Xác nhận thanh toán</li>
          <li>Chúng tôi sẽ xác nhận đơn hàng sau khi nhận được tiền</li>
        </ol>
      </div>

      <div className={styles.note}>
        <p><strong>Lưu ý:</strong> Vui lòng chuyển khoản đúng số tiền và ghi rõ nội dung để được xử lý nhanh chóng.</p>
      </div>
    </div>
  );
}
