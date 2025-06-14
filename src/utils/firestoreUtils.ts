import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

export interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'ml' | 'design' | 'devops' | 'other';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  type: 'work' | 'internship' | 'hackathon' | 'project';
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  relevantCoursework: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  role: string;
  startDate: string;
  endDate: string;
  demoLink?: string;
  repoLink?: string;
}

export interface UserProfileData {
  id: string;
  name: string;
  title: string;
  bio: string;
  location: string;
  timezone: string;
  email: string;
  phone?: string;
  profilePicture?: string; // URL from Cloudinary
  coverPhoto?: string;    // URL from Cloudinary
  technicalSkills: Skill[];
  softSkills: string[];
  languages: string[];
  tools: string[];
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    devpost?: string;
    twitter?: string;
    other?: string[];
  };
}

export interface Message {
  id?: string; // Optional for new messages before they are saved to Firestore
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: any; // Use firebase.firestore.FieldValue.serverTimestamp() for new messages
}

export interface Announcement {
  id?: string;
  teamId: string;
  senderId: string;
  senderName: string;
  title: string;
  content: string;
  timestamp: any;
}

export const saveUserProfile = async (userId: string, profileData: UserProfileData) => {
  console.log(`[firestoreUtils] Attempting to save profile for userId: ${userId}`);
  try {
    const { id, ...dataToSave } = profileData;
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, dataToSave, { merge: true });
    console.log(`[firestoreUtils] Profile saved successfully for userId: ${userId}`);
    return true;
  } catch (error) {
    console.error('[firestoreUtils] Error saving profile:', error);
    throw error;
  }
};

// Function to get user profile data
export const getUserProfileData = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as UserProfileData;
    } else {
      return null; // Profile not found
    }
  } catch (error) {
    console.error('[firestoreUtils] Error getting profile:', error);
    throw error;
  }
};

// Function to send a chat message
export const sendTeamMessage = async (
  teamId: string,
  senderId: string,
  senderName: string,
  text: string,
  senderAvatar?: string
) => {
  try {
    const messagesRef = collection(db, 'teams', teamId, 'messages');
    await addDoc(messagesRef, {
      senderId,
      senderName,
      senderAvatar: senderAvatar || null,
      text,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Function to get real-time chat messages
export const getTeamMessages = (teamId: string, callback: (messages: Message[]) => void) => {
  const messagesRef = collection(db, 'teams', teamId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data() as Message
      });
    });
    callback(messages);
  });
};

// Function to add a team announcement
export const addAnnouncement = async (
  teamId: string,
  senderId: string,
  senderName: string,
  title: string,
  content: string
) => {
  try {
    const announcementsRef = collection(db, 'teams', teamId, 'announcements');
    await addDoc(announcementsRef, {
      senderId,
      senderName,
      title,
      content,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding announcement:', error);
    throw error;
  }
};

// Function to get real-time team announcements
export const getAnnouncements = (teamId: string, callback: (announcements: Announcement[]) => void) => {
  const announcementsRef = collection(db, 'teams', teamId, 'announcements');
  const q = query(announcementsRef, orderBy('timestamp', 'desc')); // Order by newest first

  return onSnapshot(q, (snapshot) => {
    const announcements: Announcement[] = [];
    snapshot.forEach((doc) => {
      announcements.push({
        id: doc.id,
        ...doc.data() as Announcement
      });
    });
    callback(announcements);
  });
};

export const setUserAsAdmin = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { isAdmin: true }, { merge: true });
    console.log(`[firestoreUtils] User ${userId} set as admin successfully`);
    return true;
  } catch (error) {
    console.error('[firestoreUtils] Error setting user as admin:', error);
    throw error;
  }
}; 