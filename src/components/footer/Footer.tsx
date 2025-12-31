import React from 'react';
import styles from './Footer.module.css';

export default function Footer() { 
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <p>&copy; 2025 Web Du Lịch. All rights reserved.</p>
            </div>
        </footer>
    );
}