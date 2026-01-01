import styles from './Card.module.css';

export default function Card({ title, description, imageUrl, price }: { title: string; description: string; imageUrl: string; price: string }) {
  return (
    <div className={styles.card}>
      <img src={imageUrl} alt={title} className={styles.cardImage} />
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
        <p className={styles.cardPrice}>{price}</p>
      </div>
    </div>
  );
}