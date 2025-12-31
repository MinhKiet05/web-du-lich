import React from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './TourPage.module.css';

export default function TourPage() {
  const { currentUser } = useAuth();

  return (
    <div className={styles.tourPage}>
      <div className={styles.container}>
        <h1>Danh sách Tour</h1>
        <p>Khám phá những tour du lịch tuyệt vời</p>
        {currentUser && (
          <p>Xin chào {currentUser.displayName}! Tìm tour phù hợp với bạn.</p>
        )}
        {/* Nội dung tour sẽ được thêm sau */}
      </div>
    </div>
  );
}