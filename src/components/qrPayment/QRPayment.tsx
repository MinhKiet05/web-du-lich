
import { useMemo } from 'react';
import styles from './QRPayment.module.css';

interface QRPaymentProps {
  amount: number;
  orderId: string;
  onClose?: () => void;
}

export default function QRPayment({ amount, orderId, onClose }: QRPaymentProps) {
  const bank = "Sacombank";
  const bankCode = "970403"; // Mã ngân hàng Sacombank
  const account = "070131493051";
  const accountName = "TRAN HUYNH MINH KIET";
  const transferContent = `${orderId}`;

  // Tạo VietQR URL động với số tiền khóa cứng
  const qrUrl = useMemo(() => {
    const baseUrl = "https://img.vietqr.io/image";
    // Sử dụng template 'print' để khóa cứng thông tin
    const template = 'print';
    const params = new URLSearchParams({
      'accountName': accountName,
      'amount': amount.toString(),
      'addInfo': transferContent
    });
    
    // URL format: https://img.vietqr.io/image/{bank_id}-{account_number}-{template}.png?{params}
    return `${baseUrl}/${bankCode}-${account}-${template}.png?${params.toString()}`;
  }, [bankCode, account, amount, transferContent, accountName]);

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
          src={qrUrl} 
          alt="QR thanh toán" 
          className={styles.qrImage}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Sử dụng QR server đơn giản như fallback
            target.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=2|99|${account}||${accountName}|${bankCode}|${amount}|${transferContent}|VN`;
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
          <li>Mở ứng dụng banking (VCB, ACB, TPBank...) hoặc MoMo</li>
          <li>Quét mã QR</li>
          <li>Kiểm tra thông tin hiển thị:
            <ul style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>
              <li>Số tiền: {amount.toLocaleString('vi-VN')} VND</li>
              <li>Nội dung: {transferContent}</li>
            </ul>
          </li>
          <li>Xác nhận thanh toán</li>
          <li>Chúng tôi sẽ xác nhận đơn hàng sau khi nhận được tiền</li>
        </ol>
      </div>
    </div>
  );
}
