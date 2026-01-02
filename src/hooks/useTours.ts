import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

interface Tour {
  _id: string;
  name: string;
  short_name: string;
  type: string;
  price: {
    amount: number;
    currency: string;
    display: string;
  };
  rating_summary?: {
    average: number;
    count: number;
  };
  specs: Array<{
    k: string;
    v: string;
  }>;
  images: Array<{
    url: string;
    caption: string;
  }>;
}

export const useTours = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const toursQuery = query(
          collection(db, 'tours'),
          orderBy('name', 'asc')
        );
        
        const querySnapshot = await getDocs(toursQuery);
        const toursData: Tour[] = [];
        
        querySnapshot.forEach((doc) => {
          toursData.push({
            _id: doc.id,
            ...doc.data()
          } as Tour);
        });
        
        setTours(toursData);
        setError(null);
      } catch (err) {
        console.error('Error fetching tours:', err);
        setError('Không thể tải dữ liệu tours');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  return { tours, loading, error };
};