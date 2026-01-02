import styles from './AboutPage.module.css';

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.container}>
        <h1>Về chúng tôi, anh Kiệt béo</h1>
        <p>Chào mừng bạn đến với công ty du lịch của chúng tôi!</p>
        <div className={styles.content}>
          <p>Chúng tôi chuyên cung cấp các dịch vụ du lịch chất lượng cao...</p>
          {/* Nội dung về công ty sẽ được thêm sau */}
        </div>
      </div>
    </div>
  );
}