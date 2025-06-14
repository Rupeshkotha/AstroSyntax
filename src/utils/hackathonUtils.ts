import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Hackathon } from './types';

const HACKATHONS_COLLECTION = 'hackathons';

// Helper function to determine hackathon status
export const getHackathonStatus = (hackathon: Hackathon): 'upcoming' | 'ongoing' | 'past' => {
  const now = new Date();
  const startDate = new Date(hackathon.startDate);
  const endDate = new Date(hackathon.endDate);

  // Convert all dates to UTC for consistent comparison
  const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes());
  const startUTC = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), startDate.getUTCHours(), startDate.getUTCMinutes());
  const endUTC = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), endDate.getUTCHours(), endDate.getUTCMinutes());

  if (nowUTC < startUTC) {
    return 'upcoming';
  } else if (nowUTC >= startUTC && nowUTC <= endUTC) {
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
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const hackathon: Hackathon = {
        id: doc.id,
        title: data.title,
        description: data.description,
        overview: data.overview,
        eligibility: data.eligibility,
        techStack: data.techStack,
        timeline: data.timeline,
        teamSize: data.teamSize,
        prize: data.prize,
        startDate: data.startDate.toDate().toISOString(),
        endDate: data.endDate.toDate().toISOString(),
        location: data.location,
        platform: data.platform,
        domain: data.domain,
        registrationLink: data.registrationLink,
        status: 'upcoming', // This will be updated below
        thumbnailUrl: data.thumbnailUrl
      };
      // Calculate current status
      hackathon.status = getHackathonStatus(hackathon);
      return hackathon;
    });
  } catch (error) {
    console.error('Error getting all hackathons:', error);
    throw error;
  }
};

// New function to get a single hackathon by ID
export const getHackathonById = async (id: string): Promise<Hackathon | null> => {
  try {
    const docRef = doc(db, HACKATHONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        description: data.description,
        overview: data.overview,
        eligibility: data.eligibility,
        techStack: data.techStack,
        timeline: data.timeline,
        teamSize: data.teamSize,
        prize: data.prize,
        startDate: data.startDate.toDate().toISOString(),
        endDate: data.endDate.toDate().toISOString(),
        location: data.location,
        platform: data.platform,
        domain: data.domain,
        registrationLink: data.registrationLink,
        status: getHackathonStatus(data as Hackathon), // Ensure status is calculated
        thumbnailUrl: data.thumbnailUrl
      } as Hackathon;
    } else {
      console.log("No such hackathon document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting hackathon by ID:", error);
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