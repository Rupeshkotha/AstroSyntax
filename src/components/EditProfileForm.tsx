import React, { useState, useEffect, useRef } from 'react';
import { UserProfileData, saveUserProfile, uploadProfileImage, Skill } from '../utils/firestoreUtils';
import { TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

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

interface EditProfileFormProps {
  initialData: UserProfileData;
  onSave: (data: UserProfileData) => void;
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ initialData, onSave, onCancel }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<UserProfileData>(initialData);
  const [skillInputs, setSkillInputs] = useState<{ [key: number]: string }>({});
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [activeSkillIndex, setActiveSkillIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [coverImageLoading, setCoverImageLoading] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      
      // Handle profile picture loading
      if (initialData.profilePicture) {
        console.log('[useEffect] Setting profile image loading, URL:', initialData.profilePicture);
        setProfileImageLoading(true);
        
        // Preload the image to ensure it's in the browser cache
        const profileImg = new Image();
        profileImg.onload = () => {
          console.log('[useEffect] Profile image preloaded successfully');
          // Small delay to ensure state updates properly
          setTimeout(() => setProfileImageLoading(false), 100);
        };
        profileImg.onerror = () => {
          console.error('[useEffect] Failed to preload profile image');
          setProfileImageLoading(false);
        };
        // Add cache-busting parameter if not already present
        profileImg.src = initialData.profilePicture.includes('?') 
          ? initialData.profilePicture 
          : `${initialData.profilePicture}?t=${Date.now()}`;
      }
      
      // Handle cover photo loading
      if (initialData.coverPhoto) {
        console.log('[useEffect] Setting cover image loading, URL:', initialData.coverPhoto);
        setCoverImageLoading(true);
        
        // Preload the image to ensure it's in the browser cache
        const coverImg = new Image();
        coverImg.onload = () => {
          console.log('[useEffect] Cover image preloaded successfully');
          // Small delay to ensure state updates properly
          setTimeout(() => setCoverImageLoading(false), 100);
        };
        coverImg.onerror = () => {
          console.error('[useEffect] Failed to preload cover image');
          setCoverImageLoading(false);
        };
        // Add cache-busting parameter if not already present
        coverImg.src = initialData.coverPhoto.includes('?') 
          ? initialData.coverPhoto 
          : `${initialData.coverPhoto}?t=${Date.now()}`;
      }
    }
    
    setLoading(false);
  }, [initialData]);

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    setSkillInputs(prev => ({ ...prev, [index]: value }));

    // Filter suggestions based on input
    if (value.trim()) {
      const filtered = commonSkills.filter(skill => 
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !formData.technicalSkills.some(s => s.name.toLowerCase() === skill.toLowerCase())
      );
      setSkillSuggestions(filtered.slice(0, 5));
      setActiveSkillIndex(index);
    } else {
      setSkillSuggestions([]);
      setActiveSkillIndex(-1);
    }
  };

  const handleSkillCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
    const newSkills = [...formData.technicalSkills];
    newSkills[index] = {
      ...newSkills[index],
      category: e.target.value as Skill['category']
    };
    setFormData(prev => ({
      ...prev,
      technicalSkills: newSkills
    }));
  };

  const handleSkillProficiencyChange = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
    const newSkills = [...formData.technicalSkills];
    newSkills[index] = {
      ...newSkills[index],
      proficiency: e.target.value as Skill['proficiency']
    };
    setFormData(prev => ({
      ...prev,
      technicalSkills: newSkills
    }));
  };

  const handleSkillSuggestionClick = (suggestion: string) => {
    if (activeSkillIndex !== -1) {
      const newSkills = [...formData.technicalSkills];
      newSkills[activeSkillIndex] = {
        id: newSkills[activeSkillIndex].id, // Preserve existing id
        name: suggestion,
        category: newSkills[activeSkillIndex].category,
        proficiency: newSkills[activeSkillIndex].proficiency
      };
      setFormData(prev => ({
        ...prev,
        technicalSkills: newSkills
      }));
      setSkillInputs(prev => ({ ...prev, [activeSkillIndex]: suggestion }));
      setSkillSuggestions([]);
      setActiveSkillIndex(-1);
    }
  };

  const handleDeleteImage = async (type: 'profile' | 'cover') => {
    if (!currentUser) return;
    
    console.log(`[${type}] Deleting image...`);
    setError(null);
    
    try {
      // Set loading state
      if (type === 'profile') {
        setUploadingProfileImage(true);
      } else {
        setUploadingCoverImage(true);
      }
      
      // Update the user profile in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = type === 'profile' 
        ? { profilePicture: null } 
        : { coverPhoto: null };
      
      await setDoc(userRef, updateData, { merge: true });
      
      // Update local state
      setFormData(prev => ({
        ...prev,
        [type === 'profile' ? 'profilePicture' : 'coverPhoto']: ''
      }));
      
      console.log(`[${type}] Image deleted successfully`);
      setSuccess(`${type === 'profile' ? 'Profile' : 'Cover'} image deleted successfully`);
      
    } catch (error: any) {
      console.error(`[${type}] Error deleting image:`, error);
      setError(error.message || `Failed to delete ${type} image`);
    } finally {
      // Reset loading state
      if (type === 'profile') {
        setUploadingProfileImage(false);
      } else {
        setUploadingCoverImage(false);
      }
    }
  };

  const handleImageUpload = async (file: File, type: 'profile' | 'cover') => {
  if (!currentUser) return;

  console.log(`[${type}] Starting image upload...`);
  setError(null); // Clear any previous errors

  try {
    if (type === 'profile') {
      setUploadingProfileImage(true);
      setProfileImageLoading(true);
      console.log(`[${type}] setUploadingProfileImage(true), setProfileImageLoading(true)`);
    } else {
      setUploadingCoverImage(true);
      setCoverImageLoading(true);
      console.log(`[${type}] setUploadingCoverImage(true), setCoverImageLoading(true)`);
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error(`Image size exceeds 10MB limit. Please choose a smaller image.`);
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.`);
    }

    console.log(`[${type}] File validation passed. Size: ${(file.size / 1024).toFixed(2)}KB, Type: ${file.type}`);

    let downloadURL = await uploadProfileImage(currentUser.uid, file, type);
    console.log(`[${type}] uploadProfileImage completed, downloadURL:`, downloadURL);

    // Add a cache-busting parameter to force a fresh image load
    downloadURL = `${downloadURL}?t=${Date.now()}`;
    console.log(`[${type}] Updated downloadURL with cache-busting parameter:`, downloadURL);

    // Update the form data with the new image URL
    setFormData(prev => {
      const newState = {
        ...prev,
        [type === 'profile' ? 'profilePicture' : 'coverPhoto']: downloadURL
      };
      console.log(`[${type}] setFormData called, new state for ${type} picture:`, newState[type === 'profile' ? 'profilePicture' : 'coverPhoto']);
      
      // Force a reload of the image by setting loading state again briefly
      if (type === 'profile') {
        setTimeout(() => setProfileImageLoading(true), 10);
        setTimeout(() => setProfileImageLoading(false), 500);
      } else {
        setTimeout(() => setCoverImageLoading(true), 10);
        setTimeout(() => setCoverImageLoading(false), 500);
      }
      
      return newState;
    });

  } catch (error: any) {
    console.error(`[${type}] Error uploading image:`, error);
    setError(error.message || 'Failed to upload image. Please try again.');
    if (type === 'profile') {
      setProfileImageLoading(false);
    } else {
      setCoverImageLoading(false);
    }
    console.log(`[${type}] Error caught, setProfileImageLoading/setCoverImageLoading(false)`);
  } finally {
    if (type === 'profile') {
      setUploadingProfileImage(false);
      console.log(`[${type}] Finally block: setUploadingProfileImage(false)`);
    } else {
      setUploadingCoverImage(false);
      console.log(`[${type}] Finally block: setUploadingCoverImage(false)`);
    }
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!currentUser) {
    setError('You must be logged in to save your profile');
    return;
  }

  setSaving(true);
  setError(null);
  setSuccess(null);

  try {
    // Save to Firestore
    await saveUserProfile(currentUser.uid, formData);

    // Call the parent's onSave callback
    onSave(formData);

    setSuccess('Profile saved successfully!');
  } catch (err: any) {
    setError(err.message || 'Failed to save profile');
  } finally {
    setSaving(false);
  }
};

const addEducation = () => {
  setFormData(prev => ({
    ...prev,
    education: [
      ...prev.education,
      {
        id: Date.now().toString(),
        institution: '',
        degree: '',
        major: '',
        startDate: '',
        endDate: '',
        relevantCoursework: []
      }
    ]
  }));
};

  const addExperience = () => {
    setFormData(prev => ({
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
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: Date.now().toString(),
        name: '',
        description: '',
        technologies: [],
        role: '',
        startDate: '',
        endDate: '',
      }]
    }));
  };

  const addLink = () => {
    const newLinkKey = `new-link-${new Date().getTime()}`;
    setFormData(prev => ({
      ...prev,
      links: { ...prev.links, [newLinkKey]: '' } // Add a unique key for the new link
    }));
  };

  const handleAddLink = () => {
    addLink();
  };

  const handleDeleteLink = (platformToDelete: string) => {
    setFormData(prev => {
      const newLinks = { ...prev.links };
      delete newLinks[platformToDelete as keyof typeof newLinks];
      return { ...prev, links: newLinks };
    });
  };

  const handleLinkChange = (platform: string, newPlatform: string, newUrl: string) => {
    setFormData(prev => {
      const newLinks = { ...prev.links };
      if (platform !== newPlatform) {
        delete newLinks[platform as keyof typeof newLinks];
      }
      newLinks[newPlatform] = newUrl;
      return { ...prev, links: newLinks };
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {error && (
        <div className="p-3 bg-red-800 text-red-200 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-green-800 text-green-200 rounded-lg">{success}</div>
      )}

      {/* Image Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <label className="block text-sm font-medium text-gray-300 mb-2">Profile Picture</label>
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-600 bg-gray-700 shadow-md flex items-center justify-center group">
            {uploadingProfileImage ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center h-full w-full text-gray-400 text-base font-semibold space-y-2 bg-gray-800 bg-opacity-90">
                <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </div>
            ) : profileImageLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center h-full w-full text-gray-400 text-base font-semibold space-y-2 bg-gray-800 bg-opacity-90">
                <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading image...</span>
              </div>
            ) : formData.profilePicture ? (
              <img
                key={`profile-${Date.now()}`} // Force re-render on each render cycle
                src={formData.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
                onLoad={() => {
                  console.log('[profile] Image loaded successfully');
                  setProfileImageLoading(false);
                }}
                onError={(e) => {
                  console.error('[profile] Error loading image:', e);
                  setProfileImageLoading(false);
                  
                  // Try loading the image with a different cache-busting parameter
                  const imgElement = e.target as HTMLImageElement;
                  const baseUrl = formData.profilePicture?.split('?')[0] || '';
                  if (!imgElement.src.includes('retry=')) {
                    console.log('[profile] Retrying image load with cache-busting');
                    setTimeout(() => {
                      imgElement.src = `${baseUrl}?retry=true&t=${Date.now()}`;
                    }, 500);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">👤</div>
            )}
            <input
              ref={profileImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'profile');
              }}
            />
            {!uploadingProfileImage && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={() => profileImageInputRef.current?.click()}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Change Photo
                </button>
                {formData.profilePicture && (
                  <button
                    type="button"
                    onClick={() => handleDeleteImage('profile')}
                    className="px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-red-500/40 transition-colors"
                  >
                    Delete Photo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Cover Photo */}
        <div className="flex flex-col items-center">
          <label className="block text-sm font-medium text-gray-300 mb-2">Cover Photo</label>
          <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-600 bg-gray-700 shadow-md flex items-center justify-center group">
            {uploadingCoverImage ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center h-full w-full text-gray-400 text-base font-semibold space-y-2 bg-gray-800 bg-opacity-90">
                <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </div>
            ) : coverImageLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center h-full w-full text-gray-400 text-base font-semibold space-y-2 bg-gray-800 bg-opacity-90">
                <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading image...</span>
              </div>
            ) : formData.coverPhoto ? (
              <img
                key={`cover-${Date.now()}`} // Force re-render on each render cycle
                src={formData.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
                onLoad={() => {
                  console.log('[cover] Image loaded successfully');
                  setCoverImageLoading(false);
                }}
                onError={(e) => {
                  console.error('[cover] Error loading image:', e);
                  setCoverImageLoading(false);
                  
                  // Try loading the image with a different cache-busting parameter
                  const imgElement = e.target as HTMLImageElement;
                  const baseUrl = formData.coverPhoto?.split('?')[0] || '';
                  if (!imgElement.src.includes('retry=')) {
                    console.log('[cover] Retrying image load with cache-busting');
                    setTimeout(() => {
                      imgElement.src = `${baseUrl}?retry=true&t=${Date.now()}`;
                    }, 500);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">No Cover Photo</div>
            )}
            <input
              ref={coverImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'cover');
              }}
            />
            {!uploadingCoverImage && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={() => coverImageInputRef.current?.click()}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Change Cover Photo
                </button>
                {formData.coverPhoto && (
                  <button
                    type="button"
                    onClick={() => handleDeleteImage('cover')}
                    className="px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-red-500/40 transition-colors"
                  >
                    Delete Cover
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 border border-gray-700">
        <h2 className="text-2xl font-bold text-white">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="e.g., Full Stack Developer"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Tell us about yourself..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="e.g., San Francisco, CA"
          />
        </div>
      </div>

      {/* Education */}
      <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 border border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Education</h2>
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Education
          </button>
        </div>
        <div className="space-y-6">
          {formData.education.map((edu, index) => (
            <div key={edu.id} className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const newEducation = [...formData.education];
                        newEducation[index].institution = e.target.value;
                        setFormData(prev => ({ ...prev, education: newEducation }));
                      }}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="University or Institution name"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const newEducation = [...formData.education];
                          newEducation[index].degree = e.target.value;
                          setFormData(prev => ({ ...prev, education: newEducation }));
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="e.g., Bachelor's Degree"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Major</label>
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) => {
                          const newEducation = [...formData.education];
                          newEducation[index].major = e.target.value;
                          setFormData(prev => ({ ...prev, education: newEducation }));
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newEducation = formData.education.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, education: newEducation }));
                  }}
                  className="ml-4 text-gray-400 hover:text-red-400 transition-colors duration-200"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 border border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Experience</h2>
          <button
            type="button"
            onClick={addExperience}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Experience
          </button>
        </div>
        <div className="space-y-6">
          {formData.experiences.map((exp, index) => (
            <div key={exp.id} className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => {
                          const newExps = [...formData.experiences];
                          newExps[index].title = e.target.value;
                          setFormData(prev => ({ ...prev, experiences: newExps }));
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const newExps = [...formData.experiences];
                          newExps[index].company = e.target.value;
                          setFormData(prev => ({ ...prev, experiences: newExps }));
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => {
                          const newExps = [...formData.experiences];
                          newExps[index].startDate = e.target.value;
                          setFormData(prev => ({ ...prev, experiences: newExps }));
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                      <input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => {
                          const newExps = [...formData.experiences];
                          newExps[index].endDate = e.target.value;
                          setFormData(prev => ({ ...prev, experiences: newExps }));
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => {
                        const newExps = [...formData.experiences];
                        newExps[index].description = e.target.value;
                        setFormData(prev => ({ ...prev, experiences: newExps }));
                      }}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newExps = formData.experiences.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, experiences: newExps }));
                  }}
                  className="ml-4 text-gray-400 hover:text-red-400 transition-colors duration-200"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 border border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <button
            type="button"
            onClick={addProject}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Project
          </button>
        </div>
        <div className="space-y-6">
          {formData.projects.map((project, index) => (
            <div key={project.id} className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProjects }));
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Your Role</label>
                      <input
                        type="text"
                        value={project.role}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].role = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProjects }));
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="e.g., Lead Developer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => {
                        const newProjects = [...formData.projects];
                        newProjects[index].description = e.target.value;
                        setFormData(prev => ({ ...prev, projects: newProjects }));
                      }}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={project.startDate}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].startDate = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProjects }));
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                      <input
                        type="date"
                        value={project.endDate}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].endDate = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProjects }));
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Demo Link</label>
                      <input
                        type="url"
                        value={project.demoLink || ''}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].demoLink = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProjects }));
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="https://demo-link.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Repository Link</label>
                      <input
                        type="url"
                        value={project.repoLink || ''}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].repoLink = e.target.value;
                          setFormData(prev => ({ ...prev, projects: newProjects }));
                        }}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="https://github.com/username/project"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newProjects = formData.projects.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, projects: newProjects }));
                  }}
                  className="ml-4 text-gray-400 hover:text-red-400 transition-colors duration-200"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Skills */}
      <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 border border-gray-700">
        <h2 className="text-2xl font-bold text-white">Technical Skills</h2>
        <div className="space-y-4">
          {formData.technicalSkills.map((skill, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={skillInputs[index] || skill.name}
                    onChange={(e) => handleSkillInputChange(e, index)}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Start typing a skill..."
                  />
                  {activeSkillIndex === index && skillSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                      {skillSuggestions.map((suggestion, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
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
                  onChange={(e) => handleSkillCategoryChange(e, index)}
                  className="px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
                  onChange={(e) => handleSkillProficiencyChange(e, index)}
                  className="px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const newSkills = formData.technicalSkills.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, technicalSkills: newSkills }));
                    setSkillInputs(prev => {
                      const newInputs = { ...prev };
                      delete newInputs[index];
                      return newInputs;
                    });
                  }}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                technicalSkills: [...prev.technicalSkills, {
                  id: crypto.randomUUID(),
                  name: '',
                  category: 'other' as const,
                  proficiency: 'beginner' as const
                }]
              }));
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Skill
          </button>
        </div>
      </div>

      {/* Links */}
      <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 border border-gray-700">
        <h2 className="text-2xl font-bold text-white">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(formData.links).map(([platform, url], index) => (
            <div key={platform} className="flex items-center gap-3">
              <input
                type="text"
                value={platform}
                onChange={(e) => handleLinkChange(platform, e.target.value, url as string)}
                className="w-1/3 px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 hover:border-purple-500"
                placeholder="Platform (e.g., github)"
              />
              <input
                type="text"
                value={url as string}
                onChange={(e) => handleLinkChange(platform, platform, e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 hover:border-purple-500"
                placeholder="URL"
              />
              <button
                type="button"
                onClick={() => handleDeleteLink(platform)}
                className="p-3 text-red-400 hover:text-red-300 transition-colors transform hover:scale-105"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLink}
            className="flex items-center px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/30 transition-colors transform hover:scale-105"
          >
            <span className="mr-2">+</span> Add Link
          </button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-all duration-200"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;