import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Hackathon } from './types';

const HACKATHONS_COLLECTION = 'hackathons';

// Helper function to determine hackathon status
export const getHackathonStatus = (hackathon: Hackathon): 'upcoming' | 'ongoing' | 'past' => {
  const now = new Date();
  const startDate = new Date(hackathon.startDate);
  const endDate = new Date(hackathon.endDate);

  if (now < startDate) {
    return 'upcoming';
  } else if (now >= startDate && now <= endDate) {
    return 'ongoing';
  } else {
    return 'past';
  }
};

export const addHackathon = async (hackathon: Omit<Hackathon, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, HACKATHONS_COLLECTION), {
      ...hackathon,
      startDate: Timestamp.fromDate(new Date(hackathon.startDate)),
      endDate: Timestamp.fromDate(new Date(hackathon.endDate))
    });
    return { id: docRef.id, ...hackathon };
  } catch (error) {
    console.error('Error adding hackathon:', error);
    throw error;
  }
};

export const getAllHackathons = async () => {
  try {
    const q = query(
      collection(db, HACKATHONS_COLLECTION),
      orderBy('startDate', 'asc') // Order by start date for consistent fetching
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate().toISOString(),
      endDate: doc.data().endDate.toDate().toISOString()
    })) as Hackathon[];
  } catch (error) {
    console.error('Error getting all hackathons:', error);
    throw error;
  }
};

export const deleteHackathon = async (id: string) => {
  try {
    await deleteDoc(doc(db, HACKATHONS_COLLECTION, id));
    console.log('Hackathon successfully deleted!');
  } catch (error) {
    console.error('Error deleting hackathon:', error);
    throw error;
  }
};

export const updateHackathon = async (id: string, updatedData: Partial<Hackathon>) => {
  try {
    await updateDoc(doc(db, HACKATHONS_COLLECTION, id), {
      ...updatedData,
      // Convert dates back to Firestore Timestamps if they are being updated
      ...(updatedData.startDate && { startDate: Timestamp.fromDate(new Date(updatedData.startDate)) }),
      ...(updatedData.endDate && { endDate: Timestamp.fromDate(new Date(updatedData.endDate)) })
    });
    console.log('Hackathon successfully updated!');
  } catch (error) {
    console.error('Error updating hackathon:', error);
    throw error;
  }
}; 