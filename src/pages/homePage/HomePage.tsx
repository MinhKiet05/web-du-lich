import React from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { currentUser } = useAuth();

  return (
    <div className={styles.homePage}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <h1>Khám phá những điểm đến tuyệt vời</h1>
          <p>Chào mừng {currentUser ? currentUser.displayName : 'bạn'} đến với trang web du lịch của chúng tôi!</p>
          {currentUser && (
            <div className={styles.welcomeMessage}>
              <p>Xin chào {currentUser.displayName}! Bạn đã đăng nhập thành công.</p>
            </div>
          )}
        </section>
        
        <section className={styles.features}>
          <h2>Dịch vụ của chúng tôi</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <h3>Đặt Tour</h3>
              <p>Khám phá những tour du lịch hấp dẫn nhất</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Khách sạn</h3>
              <p>Tìm kiếm và đặt khách sạn ưng ý</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Vé máy bay</h3>
              <p>Đặt vé máy bay với giá tốt nhất</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}