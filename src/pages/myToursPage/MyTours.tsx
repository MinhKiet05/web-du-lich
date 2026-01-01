import styles from './MyTours.module.css';
export default function MyTours() {
  return (
    <div className={styles.myToursPage}>
      <div className={styles.container}>
        <h1>Tour đã đặt</h1>
        <p>Danh sách các tour bạn đã đặt sẽ hiển thị ở đây.</p>
      </div>
    </div>
  );
}