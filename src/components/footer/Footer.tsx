import React from 'react';
import styles from './Footer.module.css';

export default function Footer() { 
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className ={styles.footerContent}>
                    <div className ={styles.columnLeft}>
                        <h3 className={styles.titleContainer}>Liên hệ</h3>
                        <div className={styles.linksGrid}>
                            <a href="#">Trang chủ</a>
                            <a href="#">Về chúng tôi</a>
                            <a href="#">Dịch vụ</a>
                            <a href="#">Liên hệ</a>
                        </div>
                    </div>
                    <div className ={styles.columnRight}>
                        <div className={styles.subColumn}>
                            <h3 className={styles.titleContainer}>Mạng xã hội</h3>
                            <div className={styles.socialLinks}>
                                <a href="#">Facebook</a>
                                <a href="#">Instagram</a>
                                <a href="#">Twitter</a>
                                <a href="#">Tiktok</a>
                            </div>
                        </div>
                        <div className={styles.subColumn}>
                            <h3 className={styles.titleContainer}>Địa chỉ</h3>
                            <p>Trường Đại Học Công Nghiệp Thành Phố Hồ Chí Minh</p>
                        </div>
                    </div>  
                </div>
                <div className={styles.copyright}>
                    <p>&copy; 2025<span className={styles.brandName}> Travlia</span>. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}