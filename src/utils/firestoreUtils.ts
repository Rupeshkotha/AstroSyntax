import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config/cloudinaryConfig';

export interface Skill {
  id: string;
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
  hackathonName?: string;
  hackathonOrganizer?: string;
  teamSize?: number;
  keyFeatures?: string[];
  challenges?: string[];
  placement?: string;
  prize?: string;
  devpostLink?: string;
}

export interface Hackathon {
  id: string;
  name: string;
  organizer: string;
  startDate: string;
  endDate: string;
  placement?: string;
  prize?: string;
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
  hackathons: Hackathon[];
  links: {
    [key: string]: string | string[] | undefined; // Allow any string key with string, string[], or undefined value
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

// Function to create a notification
export const createNotification = async (
  userId: string,
  type: 'TEAM_INVITATION' | 'TEAM_JOIN_REQUEST' | 'TEAM_JOIN_RESPONSE' | 'TEAM_ANNOUNCEMENT' | 'TEAM_MENTION' | 'NEW_MESSAGE',
  title: string,
  message: string,
  link?: string,
  teamId?: string,
  senderId?: string,
  senderName?: string
) => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    await addDoc(notificationsRef, {
      type,
      title,
      message,
      timestamp: serverTimestamp(),
      read: false,
      link,
      teamId,
      senderId,
      senderName
    });
  } catch (error) {
    console.error('Error creating notification:', error);
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

    // Get team members to notify
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamRef);
    if (teamDoc.exists()) {
      const teamData = teamDoc.data();
      const members = teamData.members || [];
      
      // Create notifications for all team members except the sender
      const notificationPromises = members
        .filter((memberId: string) => memberId !== senderId)
        .map((memberId: string) => 
          createNotification(
            memberId,
            'NEW_MESSAGE',
            'New Team Message',
            `${senderName}: ${text}`,
            `/teams/${teamId}`,
            teamId,
            senderId,
            senderName
          )
        );
      
      await Promise.all(notificationPromises);
    }
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

/**
 * Uploads a profile or cover image to Cloudinary and returns the URL
 * @param userId The user ID
 * @param file The image file to upload
 * @param type The type of image ('profile' or 'cover')
 * @returns The URL of the uploaded image
 */
export const uploadProfileImage = async (
  userId: string, 
  file: File, 
  type: 'profile' | 'cover'
): Promise<string> => {
  console.log(`[firestoreUtils] Uploading ${type} image for user ${userId}`);
  
  try {
    // Create a unique folder path for the user's images
    const folderPath = `users/${userId}/${type}`;
    
    // Create a unique filename with timestamp (without the folder path)
    const timestamp = new Date().getTime();
    const filename = `image_${timestamp}`;
    
    console.log(`[firestoreUtils] Preparing to upload image to Cloudinary:
      - Cloud name: ${CLOUDINARY_CLOUD_NAME}
      - Upload preset: ${CLOUDINARY_UPLOAD_PRESET}
      - Folder path: ${folderPath}
      - Filename: ${filename}
      - File type: ${file.type}
      - File size: ${(file.size / 1024).toFixed(2)} KB`);
    
    // Create form data for the upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folderPath);
    formData.append('public_id', filename);
    
    // Upload to Cloudinary
    console.log(`[firestoreUtils] Sending request to Cloudinary API...`);
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );
    
    console.log(`[firestoreUtils] Cloudinary API response:`, response.status, response.statusText);
    
    // Get the secure URL from the response
    const imageUrl = response.data.secure_url;
    console.log(`[firestoreUtils] Image uploaded successfully, URL: ${imageUrl}`);
    
    // Update the user's profile with the new image URL
    const userRef = doc(db, 'users', userId);
    const updateData = type === 'profile' 
      ? { profilePicture: imageUrl } 
      : { coverPhoto: imageUrl };
    
    await setDoc(userRef, updateData, { merge: true });
    console.log(`[firestoreUtils] User profile updated with new ${type} image URL`);
    
    return imageUrl;
  } catch (error: any) {
    console.error(`[firestoreUtils] Error uploading ${type} image:`, error);
    
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`[firestoreUtils] Cloudinary API error response:
        - Status: ${error.response.status}
        - Data: ${JSON.stringify(error.response.data)}
        - Headers: ${JSON.stringify(error.response.headers)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`[firestoreUtils] No response received from Cloudinary API:
        - Request: ${JSON.stringify(error.request)}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(`[firestoreUtils] Error setting up request:
        - Message: ${error.message}`);
    }
    
    throw new Error(`Failed to upload ${type} image: ${error.message || 'Unknown error'}`);
  }
};