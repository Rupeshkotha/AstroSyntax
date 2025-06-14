import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile, UserProfileData, uploadProfileImage } from '../utils/firestoreUtils';
import EditProfileForm from '../components/EditProfileForm';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config/cloudinaryConfig';
import { Cloudinary } from '@cloudinary/url-gen';
import axios from 'axios';
import {
  UserCircleIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CodeBracketIcon,
  LinkIcon,
  PencilIcon,
  XMarkIcon,
  PhotoIcon,
  CameraIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../components/layout/DashboardLayout';

// Initialize Cloudinary
const cld = new Cloudinary({ cloud: { cloudName: CLOUDINARY_CLOUD_NAME } });

// Common skills list for suggestions
const commonSkills = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
  'Swift', 'Kotlin', 'R', 'Scala', 'Perl', 'Haskell', 'MATLAB', 'Dart', 'Objective-C',

  // Web Development (Frontend)
  'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind CSS', 'Bootstrap',
  'React', 'Angular', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt.js',

  // Web Development (Backend)
  'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot',
  'ASP.NET', 'Laravel', 'Ruby on Rails', 'NestJS', 'Hapi.js',

  // Mobile Development
  'React Native', 'Flutter', 'SwiftUI', 'Jetpack Compose', 'Ionic',

  // Databases
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Firebase',
  'Redis', 'Cassandra', 'Oracle DB', 'MariaDB', 'DynamoDB', 'Elasticsearch',

  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud Platform', 'Heroku', 'Netlify', 'Vercel',
  'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions',
  'CI/CD', 'DevOps', 'Serverless', 'OpenShift',

  // Version Control & Collaboration
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN',

  // AI / Machine Learning / Deep Learning
  'Machine Learning', 'Deep Learning', 'AI', 'Data Science',
  'Computer Vision', 'NLP', 'Speech Recognition', 'Reinforcement Learning',
  'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'OpenCV',
  'Transformers', 'Hugging Face', 'spaCy', 'NLTK', 'XGBoost', 'LightGBM',

  // Data Engineering & Big Data
  'Pandas', 'NumPy', 'Dask', 'Apache Spark', 'Apache Kafka',
  'Hadoop', 'Airflow', 'ETL', 'Data Warehousing', 'Data Lake',

  // Software Development Methodologies
  'Agile', 'Scrum', 'Kanban', 'TDD', 'BDD', 'Waterfall',

  // Software Engineering & Tools
  'Design Patterns', 'System Design', 'OOP', 'Functional Programming',
  'UML', 'UML Diagrams', 'Refactoring', 'Debugging', 'Unit Testing',
  'Integration Testing', 'JIRA', 'Confluence', 'Visual Studio Code', 'Eclipse', 'IntelliJ IDEA'
];

interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'ml' | 'design' | 'devops' | 'other';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  type: 'work' | 'internship' | 'hackathon' | 'project';
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  relevantCoursework: string[];
}

interface Project {
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

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>({
    id: '',
    name: '',
    title: '',
    bio: '',
    location: '',
    timezone: '',
    email: '',
    phone: '',
    profilePicture: '',
    coverPhoto: '',
    technicalSkills: [],
    softSkills: [],
    languages: [],
    tools: [],
    experiences: [],
    education: [],
    projects: [],
    links: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [activeSkillIndex, setActiveSkillIndex] = useState<number>(-1);
  const [skillInputs, setSkillInputs] = useState<{ [key: number]: string }>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // If no userId is provided in the URL, use the current user's ID
        const targetUserId = userId || currentUser?.uid;
        
        if (!targetUserId) {
          setError('No user ID provided');
          setLoading(false);
          return;
        }

        const userDocRef = doc(db, 'users', targetUserId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfileData;
          setProfileData(data);
          setIsCurrentUser(targetUserId === currentUser?.uid);
        } else {
          // If the user document doesn't exist, create a basic profile
          const basicProfile: UserProfileData = {
            id: targetUserId,
            name: currentUser?.displayName || 'Anonymous',
            title: '',
            bio: '',
            location: '',
            timezone: '',
            email: currentUser?.email || '',
            phone: '',
            profilePicture: '',
            coverPhoto: '',
            technicalSkills: [],
            softSkills: [],
            languages: [],
            tools: [],
            experiences: [],
            education: [],
            projects: [],
            links: {},
          };
          setProfileData(basicProfile);
          
          // Create the user document if it doesn't exist
          if (targetUserId === currentUser?.uid) {
            await setDoc(userDocRef, basicProfile);
          }
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [currentUser, userId]);

  // Only show edit button if viewing own profile
  const isOwnProfile = userId === currentUser?.uid || (!userId && currentUser);

  const handleSave = async (data: UserProfileData) => {
    try {
      const dataWithId = { ...data, id: currentUser!.uid };
      await saveUserProfile(currentUser!.uid, dataWithId);
      setProfileData(dataWithId);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev: UserProfileData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      await handleSave(profileData);
    }
  };

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    setSkillInputs(prev => ({ ...prev, [index]: value }));

    // Filter suggestions based on input
    if (value.trim()) {
      const filtered = commonSkills.filter(skill => 
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !profileData.technicalSkills.some(s => s.name.toLowerCase() === skill.toLowerCase())
      );
      setSkillSuggestions(filtered.slice(0, 5));
      setActiveSkillIndex(index);
    } else {
      setSkillSuggestions([]);
      setActiveSkillIndex(-1);
    }
  };

  const handleSkillSuggestionClick = (suggestion: string) => {
    if (activeSkillIndex !== -1) {
      const newSkills = [...profileData.technicalSkills];
      newSkills[activeSkillIndex] = {
        name: suggestion,
        category: newSkills[activeSkillIndex].category,
        proficiency: newSkills[activeSkillIndex].proficiency
      };
      setProfileData((prev: UserProfileData) => ({ ...prev, technicalSkills: newSkills }));
      setSkillInputs(prev => ({ ...prev, [activeSkillIndex]: suggestion }));
      setSkillSuggestions([]);
      setActiveSkillIndex(-1);
    }
  };

  const handleDeleteImage = async (type: 'profile' | 'cover') => {
    if (!currentUser) return;
    
    setUploadingImage(true);
    setError(null);
    
    try {
      // Update the user profile in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = type === 'profile' 
        ? { profilePicture: null } 
        : { coverPhoto: null };
      
      await setDoc(userRef, updateData, { merge: true });
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        [type === 'profile' ? 'profilePicture' : 'coverPhoto']: ''
      }));
      
      alert(`${type === 'profile' ? 'Profile' : 'Cover'} image deleted successfully`);
      
    } catch (err: any) {
      console.error(`Error deleting ${type} image:`, err);
      setError(`Failed to delete ${type} image. Please try again.`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    if (!currentUser || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploadingImage(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      console.log(`Uploading image to Cloudinary with preset: ${CLOUDINARY_UPLOAD_PRESET}`);
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

      console.log('Cloudinary upload successful:', response.status);
      const imageUrl = response.data.secure_url;

      let updatedProfileData: UserProfileData;
      if (type === 'profile') {
        updatedProfileData = { ...profileData, profilePicture: imageUrl };
      } else {
        updatedProfileData = { ...profileData, coverPhoto: imageUrl };
      }
      
      await saveUserProfile(currentUser.uid, updatedProfileData);
      setProfileData(updatedProfileData);
      alert(`${type === 'profile' ? 'Profile picture' : 'Cover photo'} uploaded successfully!`);
    } catch (err: any) {
      console.error(`Error uploading ${type} image:`, err);
      
      let errorMessage = `Failed to upload ${type} image. Please try again.`;
      
      // Extract more specific error message if available
      if (err.response && err.response.data && err.response.data.error && err.response.data.error.message) {
        errorMessage = `Cloudinary error: ${err.response.data.error.message}`;
        console.error('Cloudinary API error details:', err.response.data);
      }
      
      setError(errorMessage);
      
      // If the error is about unsigned upload preset, show a more helpful message
      if (errorMessage.includes('unsigned uploads') || errorMessage.includes('upload preset')) {
        setError(`${errorMessage}. Please create an unsigned upload preset in your Cloudinary dashboard named 'astrosyntax_unsigned'.`);
      }
    } finally {
      setUploadingImage(false);
      // Clear the file input field
      e.target.value = '';
    }
  };

  const handleMessageClick = () => {
    if (userId) {
      navigate(`/messages?userId=${userId}`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-600 p-4">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Cover Photo */}
        <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
          {profileData.coverPhoto ? (
            <img
              src={profileData.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
          )}
          {isCurrentUser && (
            <button
              onClick={() => document.getElementById('coverPhotoInput')?.click()}
              className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2"
            >
              <CameraIcon className="h-5 w-5" />
              Change Cover
            </button>
          )}
          <input
            type="file"
            id="coverPhotoInput"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e, 'cover')}
          />
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 -mt-16 relative">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* Profile Picture */}
                <div className="relative -mt-20">
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                    {profileData.profilePicture ? (
                      <img
                        src={profileData.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl">
                        {profileData.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  {isCurrentUser && (
                    <button
                      onClick={() => document.getElementById('profilePictureInput')?.click()}
                      className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-sm hover:bg-gray-50"
                    >
                      <CameraIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  )}
                  <input
                    type="file"
                    id="profilePictureInput"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'profile')}
                  />
                </div>

                {/* Profile Info */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                  <p className="text-gray-600">{profileData.bio || 'No bio yet'}</p>
                  <div className="flex items-center gap-4 mt-2">
                    {profileData.location && (
                      <div className="flex items-center text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {profileData.location}
                      </div>
                    )}
                    {profileData.timezone && (
                      <div className="flex items-center text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {profileData.timezone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {isCurrentUser ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleMessageClick}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    Message
                  </button>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
              {/* Left Column */}
              <div className="md:col-span-2 space-y-8">
                {/* About Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-600">{profileData.bio || 'No bio provided'}</p>
                </div>

                {/* Skills Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Technical Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.technicalSkills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {typeof skill === 'string' ? skill : skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Soft Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.softSkills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience</h2>
                  <div className="space-y-6">
                    {profileData.experiences.map((exp, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-4">
                        <h3 className="font-medium text-gray-900">{exp.title}</h3>
                        <p className="text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                        <p className="mt-2 text-gray-600">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                  <div className="space-y-3">
                    {profileData.email && (
                      <div className="flex items-center text-gray-600">
                        <EnvelopeIcon className="w-5 h-5 mr-2" />
                        <span>{profileData.email}</span>
                      </div>
                    )}
                    {profileData.phone && (
                      <div className="flex items-center text-gray-600">
                        <PhoneIcon className="w-5 h-5 mr-2" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Languages</h2>
                  <div className="flex flex-wrap gap-2">
                    {profileData.languages.map((lang, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tools */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Tools</h2>
                  <div className="flex flex-wrap gap-2">
                    {profileData.tools.map((tool, index) => (
                      <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <EditProfileForm
          initialData={profileData}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default Profile;