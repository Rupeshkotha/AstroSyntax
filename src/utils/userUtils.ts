import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface UserProfileData {
  name: string;
  email: string;
  bio?: string;
  skills?: string[];
  avatar?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  location?: string;
  timezone?: string;
  preferredLanguages?: string[];
  interests?: string[];
  experience?: string;
  education?: string;
  achievements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const getUserProfileData = async (userId: string): Promise<UserProfileData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        name: data.name || '',
        email: data.email || '',
        bio: data.bio,
        skills: data.skills || [],
        avatar: data.avatar,
        github: data.github,
        linkedin: data.linkedin,
        twitter: data.twitter,
        website: data.website,
        location: data.location,
        timezone: data.timezone,
        preferredLanguages: data.preferredLanguages || [],
        interests: data.interests || [],
        experience: data.experience,
        education: data.education,
        achievements: data.achievements || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}; 