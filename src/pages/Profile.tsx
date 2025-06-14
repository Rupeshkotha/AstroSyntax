import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile, UserProfileData, uploadProfileImage } from '../utils/firestoreUtils';
import EditProfileForm from '../components/EditProfileForm';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CLOUDINARY_CLOUD_NAME } from '../config/cloudinaryConfig';
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
} from '@heroicons/react/24/outline';

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
    id: currentUser?.uid || '',
    name: '',
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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [activeSkillIndex, setActiveSkillIndex] = useState<number>(-1);
  const [skillInputs, setSkillInputs] = useState<{ [key: number]: string }>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const targetUserId = userId || currentUser.uid;
        const userDocRef = doc(db, 'users', targetUserId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfileData;
          setProfileData(data);
        } else {
          setProfileData({
            id: currentUser.uid,
            name: currentUser.displayName || '',
            title: '',
            bio: '',
            location: '',
            timezone: '',
            email: currentUser.email || '',
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    if (!currentUser || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploadingImage(true);
    setError(null);

    const unsignedUploadPreset = 'YOUR_UNSIGNED_UPLOAD_PRESET_NAME'; // *** IMPORTANT: Replace with your actual unsigned upload preset name ***

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', unsignedUploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

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
      setError(`Failed to upload ${type} image. Please try again.`);
    } finally {
      setUploadingImage(false);
      // Clear the file input field
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      {/* Edit Profile Modal */}
      {isEditing && !userId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <EditProfileForm
              initialData={profileData}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md mb-20 group overflow-hidden">
          {profileData.coverPhoto ? (
            <img
              src={profileData.coverPhoto}
              alt="Cover Photo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-lg font-semibold">No Cover Photo</div>
          )}
          {isEditing && (
            <label
              htmlFor="cover-upload"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer text-white"
            >
              <CameraIcon className="w-8 h-8 mr-2" />
              Upload Cover Photo
              <input
                id="cover-upload"
                type="file"
                ref={coverImageInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'cover')}
                disabled={uploadingImage}
              />
            </label>
          )}
        </div>

        <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-300 absolute top-32 left-1/2 transform -translate-x-1/2 overflow-hidden flex items-center justify-center">
          {profileData.profilePicture ? (
            <img
              src={profileData.profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircleIcon className="w-24 h-24 text-gray-500" />
          )}
          {isEditing && (
            <label
              htmlFor="profile-upload"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer text-white"
            >
              <PhotoIcon className="w-8 h-8 mr-2" />
              Upload Photo
              <input
                id="profile-upload"
                type="file"
                ref={profileImageInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'profile')}
                disabled={uploadingImage}
              />
            </label>
          )}
        </div>

        <div className="text-center mt-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {profileData.name || (isEditing ? 'Your Name' : null)}
              </h1>
              {(profileData.title || isEditing) && (
                <p className="mt-1 text-gray-300">
                  {profileData.title || (isEditing ? 'Add your title' : null)}
                </p>
              )}
              {(profileData.location || isEditing) && (
                <p className="text-gray-300">
                  {profileData.location || (isEditing ? 'Add your location' : null)}
                </p>
              )}
              {(profileData.timezone || isEditing) && (
                <p className="text-gray-300">
                  {profileData.timezone || (isEditing ? 'Add your timezone' : null)}
                </p>
              )}
            </div>
            {!userId && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                {isEditing ? 'Done Editing' : 'Edit Profile'}
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Bio */}
            <div className="bg-gray-800/50 rounded-xl shadow-sm p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <UserCircleIcon className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-white">About</h2>
              </div>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself"
                />
              ) : (
                profileData.bio ? (
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {profileData.bio}
                  </p>
                ) : (
                  <p className="text-gray-500">No bio provided.</p>
                )
              )}
            </div>

            {/* Skills */}
            <div className="bg-gray-800/50 rounded-xl shadow-sm p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <CodeBracketIcon className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-white">Technical Skills</h2>
              </div>
              {isEditing ? (
                <div className="space-y-4">
                  {profileData.technicalSkills.map((skill: Skill, index: number) => (
                    <div key={index} className="relative">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={skillInputs[index] || skill.name}
                            onChange={(e) => handleSkillInputChange(e, index)}
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400"
                            placeholder="Start typing a skill..."
                          />
                          {activeSkillIndex === index && skillSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg">
                              {skillSuggestions.map((suggestion, i) => (
                                <div
                                  key={i}
                                  className="px-4 py-2 text-gray-300 hover:bg-gray-600 cursor-pointer"
                                  onClick={() => handleSkillSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <select
                          value={skill.category}
                          onChange={(e) => {
                            const newSkills = [...profileData.technicalSkills];
                            newSkills[index].category = e.target.value as Skill['category'];
                            setProfileData((prev: UserProfileData) => ({ ...prev, technicalSkills: newSkills }));
                          }}
                          className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white"
                        >
                          <option value="frontend">Frontend</option>
                          <option value="backend">Backend</option>
                          <option value="ml">ML</option>
                          <option value="design">Design</option>
                          <option value="devops">DevOps</option>
                          <option value="other">Other</option>
                        </select>
                        <select
                          value={skill.proficiency}
                          onChange={(e) => {
                            const newSkills = [...profileData.technicalSkills];
                            newSkills[index].proficiency = e.target.value as Skill['proficiency'];
                            setProfileData((prev: UserProfileData) => ({ ...prev, technicalSkills: newSkills }));
                          }}
                          className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                        <button
                          onClick={() => {
                            const newSkills = profileData.technicalSkills.filter((_: Skill, i: number) => i !== index);
                            setProfileData((prev: UserProfileData) => ({ ...prev, technicalSkills: newSkills }));
                            setSkillInputs(prev => {
                              const newInputs = { ...prev };
                              delete newInputs[index];
                              return newInputs;
                            });
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setProfileData((prev: UserProfileData) => ({
                        ...prev,
                        technicalSkills: [...prev.technicalSkills, { name: '', category: 'other', proficiency: 'beginner' }]
                      }));
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    + Add Skill
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    profileData.technicalSkills.reduce((acc: Record<string, Skill[]>, skill: Skill) => {
                      if (!acc[skill.category]) acc[skill.category] = [];
                      acc[skill.category].push(skill);
                      return acc;
                    }, {} as Record<string, Skill[]>)
                  ).map(([category, skills]) => (
                    <div key={category}>
                      <h3 className="font-medium text-gray-300 capitalize mb-2">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {(skills as Skill[]).map((skill: Skill, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600/20 text-blue-300"
                          >
                            {skill.name}
                            <span className="ml-2 text-xs text-blue-400">({skill.proficiency})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="bg-gray-800/50 rounded-xl shadow-sm p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <BriefcaseIcon className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-white">Experience</h2>
              </div>
              {isEditing ? (
                <div className="space-y-4">
                  {profileData.experiences.map((exp: Experience, index: number) => (
                    <div key={index} className="border border-gray-600 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const newExps = [...profileData.experiences];
                            newExps[index].title = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExps }));
                          }}
                          className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400"
                          placeholder="Title"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const newExps = [...profileData.experiences];
                            newExps[index].company = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExps }));
                          }}
                          className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400"
                          placeholder="Company"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => {
                            const newExps = [...profileData.experiences];
                            newExps[index].startDate = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExps }));
                          }}
                          className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400"
                          placeholder="Start Date"
                        />
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => {
                            const newExps = [...profileData.experiences];
                            newExps[index].endDate = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExps }));
                          }}
                          className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400"
                          placeholder="End Date"
                        />
                      </div>
                      <textarea
                        value={exp.description}
                        onChange={(e) => {
                          const newExps = [...profileData.experiences];
                          newExps[index].description = e.target.value;
                          setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExps }));
                        }}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 mb-4"
                        placeholder="Description"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            const newExps = profileData.experiences.filter((_: Experience, i: number) => i !== index);
                            setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExps }));
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setProfileData((prev: UserProfileData) => ({
                        ...prev,
                        experiences: [...prev.experiences, {
                          id: Date.now().toString(),
                          title: '',
                          company: '',
                          startDate: '',
                          endDate: '',
                          description: '',
                          technologies: [],
                          type: 'work'
                        }]
                      }));
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    + Add Experience
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {profileData.experiences.map((exp: Experience, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-white">{exp.title}</h3>
                      <p className="text-gray-300">{exp.company}</p>
                      <p className="text-sm text-gray-400">{exp.startDate} - {exp.endDate}</p>
                      <p className="mt-2 text-gray-300">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="bg-gray-800/50 rounded-xl shadow-sm p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <CodeBracketIcon className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-white">Projects</h2>
              </div>
              {isEditing ? (
                <div className="space-y-4">
                  {profileData.projects.map((project: Project, index: number) => (
                    <div key={index} className="border border-gray-600 rounded-lg p-4">
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => {
                          const newProjects = [...profileData.projects];
                          newProjects[index].name = e.target.value;
                          setProfileData((prev: UserProfileData) => ({ ...prev, projects: newProjects }));
                        }}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 mb-4"
                        placeholder="Project Name"
                      />
                      <textarea
                        value={project.description}
                        onChange={(e) => {
                          const newProjects = [...profileData.projects];
                          newProjects[index].description = e.target.value;
                          setProfileData((prev: UserProfileData) => ({ ...prev, projects: newProjects }));
                        }}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 mb-4"
                        placeholder="Project Description"
                      />
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={project.role}
                          onChange={(e) => {
                            const newProjects = [...profileData.projects];
                            newProjects[index].role = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, projects: newProjects }));
                          }}
                          className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400"
                          placeholder="Your Role"
                        />
                        <input
                          type="text"
                          value={project.technologies.join(', ')}
                          onChange={(e) => {
                            const newProjects = [...profileData.projects];
                            newProjects[index].technologies = e.target.value.split(',').map(t => t.trim());
                            setProfileData((prev: UserProfileData) => ({ ...prev, projects: newProjects }));
                          }}
                          className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400"
                          placeholder="Technologies (comma-separated)"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            const newProjects = profileData.projects.filter((_: Project, i: number) => i !== index);
                            setProfileData((prev: UserProfileData) => ({ ...prev, projects: newProjects }));
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setProfileData((prev: UserProfileData) => ({
                        ...prev,
                        projects: [...prev.projects, {
                          id: Date.now().toString(),
                          name: '',
                          description: '',
                          technologies: [],
                          role: '',
                          startDate: '',
                          endDate: ''
                        }]
                      }));
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    + Add Project
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {profileData.projects.map((project: Project, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-white">{project.name}</h3>
                      <p className="text-gray-300">{project.description}</p>
                      <p className="text-sm text-gray-400">Role: {project.role}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.technologies.map((tech: string, techIndex: number) => (
                          <span
                            key={techIndex}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Education */}
            <div className="bg-gray-800/50 rounded-xl shadow-sm p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <AcademicCapIcon className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-white">Education</h2>
              </div>
              {isEditing ? (
                <div className="space-y-4">
                  {profileData.education.map((edu: Education, index: number) => (
                    <div key={index} className="border border-gray-600 rounded-lg p-4">
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const newEdu = [...profileData.education];
                          newEdu[index].institution = e.target.value;
                          setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                        }}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 mb-4"
                        placeholder="Institution"
                      />
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...profileData.education];
                            newEdu[index].degree = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                          }}
                          className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400"
                          placeholder="Degree"
                        />
                        <input
                          type="text"
                          value={edu.major}
                          onChange={(e) => {
                            const newEdu = [...profileData.education];
                            newEdu[index].major = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                          }}
                          className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400"
                          placeholder="Major"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            const newEdu = profileData.education.filter((_: Education, i: number) => i !== index);
                            setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setProfileData((prev: UserProfileData) => ({
                        ...prev,
                        education: [...prev.education, {
                          id: Date.now().toString(),
                          institution: '',
                          degree: '',
                          major: '',
                          startDate: '',
                          endDate: '',
                          relevantCoursework: []
                        }]
                      }));
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    + Add Education
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {profileData.education.map((edu: Education, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-white">{edu.institution}</h3>
                      <p className="text-gray-300">{edu.degree} in {edu.major}</p>
                      <p className="text-sm text-gray-400">{edu.startDate} - {edu.endDate}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Links */}
            <div className="bg-gray-800/50 rounded-xl shadow-sm p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <LinkIcon className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-white">Links</h2>
              </div>
              {isEditing ? (
                <div className="space-y-4">
                  {Object.entries(profileData.links).map(([platform, url], index) => {
                    const typedUrl = url as string | string[];
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={typeof typedUrl === 'string' ? typedUrl : typedUrl[0]}
                          onChange={(e) => {
                            setProfileData((prev: UserProfileData) => ({
                              ...prev,
                              links: { ...prev.links, [platform]: e.target.value }
                            }));
                          }}
                          className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400"
                          placeholder={`${platform} URL`}
                        />
                        <button
                          onClick={() => {
                            const newLinks = { ...profileData.links };
                            delete newLinks[platform as keyof typeof profileData.links];
                            setProfileData((prev: UserProfileData) => ({ ...prev, links: newLinks }));
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => {
                      const platform = prompt('Enter platform name (e.g., github, linkedin):');
                      if (platform) {
                        setProfileData((prev: UserProfileData) => ({
                          ...prev,
                          links: { ...prev.links, [platform]: '' }
                        }));
                      }
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    + Add Link
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(profileData.links).map(([platform, url], index) => {
                    const typedUrl = url as string | string[];
                    return (
                      <a
                        key={index}
                        href={typeof typedUrl === 'string' ? typedUrl : typedUrl[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-400 hover:text-blue-300"
                      >
                        <span className="capitalize">{platform}</span>
                        <LinkIcon className="h-4 w-4 ml-2" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;