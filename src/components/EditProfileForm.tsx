import React, { useState, useEffect, useRef } from 'react';
import { UserProfileData, saveUserProfile, uploadProfileImage } from '../utils/firestoreUtils';
import { TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

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
      if (initialData.profilePicture) setProfileImageLoading(true);
      if (initialData.coverPhoto) setCoverImageLoading(true);
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

  const handleSkillSuggestionClick = (suggestion: string) => {
    if (activeSkillIndex !== -1) {
      const newSkills = [...formData.technicalSkills];
      newSkills[activeSkillIndex] = {
        name: suggestion,
        category: newSkills[activeSkillIndex].category,
        proficiency: newSkills[activeSkillIndex].proficiency
      };
      setFormData(prev => ({ ...prev, technicalSkills: newSkills }));
      setSkillInputs(prev => ({ ...prev, [activeSkillIndex]: suggestion }));
      setSkillSuggestions([]);
      setActiveSkillIndex(-1);
    }
  };

  const handleImageUpload = async (file: File, type: 'profile' | 'cover') => {
  if (!currentUser) return;

  console.log(`[${type}] Starting image upload...`);

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

    let downloadURL = await uploadProfileImage(currentUser.uid, file, type);
    console.log(`[${type}] uploadProfileImage completed, downloadURL:`, downloadURL);

    downloadURL = `${downloadURL}?t=${Date.now()}`;
    console.log(`[${type}] Updated downloadURL:`, downloadURL);

    setFormData(prev => {
      const newState = {
        ...prev,
        [type === 'profile' ? 'profilePicture' : 'coverPhoto']: downloadURL
      };
      console.log(`[${type}] setFormData called, new state for ${type} picture:`, newState[type === 'profile' ? 'profilePicture' : 'coverPhoto']);
      return newState;
    });

  } catch (error) {
    console.error(`[${type}] Error uploading image:`, error);
    setError('Failed to upload image');
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
    const platform = prompt('Enter platform name (e.g., github, linkedin):');
    if (platform) {
      setFormData(prev => ({
        ...prev,
        links: { ...prev.links, [platform]: '' }
      }));
    }
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
                key={formData.profilePicture}
                src={formData.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
                onLoad={() => setProfileImageLoading(false)}
                onError={() => setProfileImageLoading(false)}
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
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={() => profileImageInputRef.current?.click()}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Change Photo
                </button>
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
                key={formData.coverPhoto}
                src={formData.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
                onLoad={() => setCoverImageLoading(false)}
                onError={() => setCoverImageLoading(false)}
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
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={() => coverImageInputRef.current?.click()}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Change Cover Photo
                </button>
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
                  onChange={(e) => {
                    const newSkills = [...formData.technicalSkills];
                    newSkills[index].category = e.target.value as any;
                    setFormData(prev => ({ ...prev, technicalSkills: newSkills }));
                  }}
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
                  onChange={(e) => {
                    const newSkills = [...formData.technicalSkills];
                    newSkills[index].proficiency = e.target.value as any;
                    setFormData(prev => ({ ...prev, technicalSkills: newSkills }));
                  }}
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
                technicalSkills: [...prev.technicalSkills, { name: '', category: 'other', proficiency: 'beginner' }]
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
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-300 w-24">GitHub:</label>
            <input
              type="text"
              value={formData.links.github || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  links: { ...prev.links, github: e.target.value }
                }));
              }}
              className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400"
              placeholder="https://github.com/username"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-300 w-24">LinkedIn:</label>
            <input
              type="text"
              value={formData.links.linkedin || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  links: { ...prev.links, linkedin: e.target.value }
                }));
              }}
              className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-300 w-24">Twitter:</label>
            <input
              type="text"
              value={formData.links.twitter || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  links: { ...prev.links, twitter: e.target.value }
                }));
              }}
              className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400"
              placeholder="https://twitter.com/username"
            />
          </div>
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