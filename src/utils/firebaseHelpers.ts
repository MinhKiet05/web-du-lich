import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toursData from '../data/Tours.json';

// Function để upload tours data lên Firebase
export const uploadToursToFirebase = async () => {
  try {
    const toursCollection = collection(db, 'tours');
    
    for (const tour of toursData) {
      const tourDocRef = doc(toursCollection, tour._id);
      await setDoc(tourDocRef, {
        ...tour,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`Uploaded tour: ${tour.name}`);
    }
    
    console.log('All tours uploaded successfully!');
  } catch (error) {
    console.error('Error uploading tours to Firebase:', error);
  }
};

// Function để lấy tất cả tours từ Firebase
export const getAllToursFromFirebase = async () => {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const toursCollection = collection(db, 'tours');
    const snapshot = await getDocs(toursCollection);
    
    const tours = snapshot.docs.map(doc => ({
      ...doc.data()
    }));
    
    return tours;
  } catch (error) {
    console.error('Error fetching tours from Firebase:', error);
    return [];
  }
};

// Function để lấy một tour theo ID từ Firebase
export const getTourByIdFromFirebase = async (tourId: string) => {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const tourDocRef = doc(db, 'tours', tourId);
    const tourDocSnap = await getDoc(tourDocRef);
    
    if (tourDocSnap.exists()) {
      return {
        ...tourDocSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching tour from Firebase:', error);
    return null;
  }
};

// Function để tìm kiếm tours theo tên và ngày
export const searchToursFromFirebase = async (searchQuery: string = '', selectedDate: string = '') => {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const toursCollection = collection(db, 'tours');
    const snapshot = await getDocs(toursCollection);
    
    const allTours = snapshot.docs.map(doc => ({
      ...doc.data()
    })) as any[];

    let filteredTours = allTours;

    // Filter by search query (tên tour)
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredTours = filteredTours.filter(tour => {
        const name = tour.name?.toLowerCase() || '';
        const shortName = tour.short_name?.toLowerCase() || '';
        return name.includes(query) || shortName.includes(query);
      });
    }

    // Filter by selected date (ngày khởi hành)
    if (selectedDate) {
      const searchDate = new Date(selectedDate);
      filteredTours = filteredTours.filter(tour => {
        if (!tour.upcoming_departures || tour.upcoming_departures.length === 0) {
          return false;
        }
        
        return tour.upcoming_departures.some((departure: any) => {
          const departureDate = new Date(departure.date);
          return departureDate.toDateString() === searchDate.toDateString();
        });
      });
    }

    return filteredTours;
  } catch (error) {
    console.error('Error searching tours from Firebase:', error);
    return [];
  }
};