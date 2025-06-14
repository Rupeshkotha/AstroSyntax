import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

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
  // Basic Overview
  name: string;
  title: string;
  bio: string;
  location: string;
  timezone: string;
  email: string;
  phone?: string;
  profilePicture?: string;

  // Skills
  technicalSkills: Skill[];
  softSkills: string[];
  languages: string[];
  tools: string[];

  // Experience
  experiences: Experience[];

  // Education
  education: Education[];

  // Projects
  projects: Project[];

  // Links
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    devpost?: string;
    twitter?: string;
    other?: string[];
  };
}

export const saveUserProfile = async (userId: string, profileData: UserProfileData) => {
  if (!userId) {
    console.error("Cannot save profile: User ID is missing.");
    return;
  }

  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, profileData, { merge: true });
    console.log("User profile saved successfully for user:", userId);
  } catch (error: any) {
    console.error("Error saving user profile:", error.message);
    throw error; // Re-throw to allow calling component to handle it
  }
}; 