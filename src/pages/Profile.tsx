import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile, getUserProfileData, UserProfileData, uploadProfileImage } from '../utils/firestoreUtils';
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
  CameraIcon,
  TrashIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
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
  id: string;
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

interface Hackathon {
  id: string;
  name: string;
  organizer: string;
  startDate: string;
  endDate: string;
  placement?: string;
  prize?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

interface SkillBadgeProps {
  skill: Skill;
  index: number;
}

interface ExperienceCardProps {
  experience: Experience;
  index: number;
}

const GlowingCard: React.FC<GlowingCardProps> = ({ children, className = '', delay = 0 }) => (
  <div 
    className={`relative group transform transition-all duration-700 hover:scale-[1.02] ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-blue-500/50 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
    <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      {children}
    </div>
  </div>
);

const SkillBadge: React.FC<SkillBadgeProps> = ({ skill, index }) => {
  const proficiencyColors: Record<string, string> = {
    beginner: 'from-emerald-400 to-blue-500',
    intermediate: 'from-blue-400 to-indigo-500',
    advanced: 'from-indigo-400 to-purple-500',
    expert: 'from-purple-400 to-pink-500'
  };

  const proficiencyWidth: Record<string, string> = {
    beginner: 'w-1/4',
    intermediate: 'w-1/2',
    advanced: 'w-3/4',
    expert: 'w-full'
  };

  return (
    <div className="relative group bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">{skill.name}</span>
        <span className="text-sm text-gray-400 capitalize">{skill.proficiency}</span>
      </div>
      <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${proficiencyColors[skill.proficiency]} ${proficiencyWidth[skill.proficiency]} rounded-full transition-all duration-1000 group-hover:animate-pulse`}
        ></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
    </div>
  );
};

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, index }) => (
  <div 
    className="relative group"
    style={{ animationDelay: `${index * 200}ms` }}
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/50 via-blue-500/50 to-purple-500/50 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
    <div className="relative bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">{experience.title}</h3>
          <p className="text-lg text-gray-300">{experience.company}</p>
          <p className="text-sm text-gray-400">
            {new Date(experience.startDate).toLocaleDateString()} - {new Date(experience.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      <p className="mt-4 text-gray-300 leading-relaxed">{experience.description}</p>
      
      <div className="flex flex-wrap gap-2 mt-4">
        {experience.technologies.map((tech: string, techIndex: number) => (
          <span 
            key={techIndex}
            className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-300 rounded-full text-sm border border-blue-500/20 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const handleMessageClick = () => {
    if (userId) {
      navigate(`/messages?userId=${userId}`);
    }
  };
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>({
    id: '',
    name: '',
    title: '',
    bio: '',
    location: '',
    timezone: '',
    email: '',
    phone: '',
    technicalSkills: [],
    softSkills: [],
    languages: [],
    tools: [],
    experiences: [],
    education: [],
    projects: [],
    hackathons: [],
    links: {}
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
          const data = await getUserProfileData(targetUserId);
          if (data) {
            setProfileData(data);
          } else {
            setProfileData({
              id: currentUser.uid || '',
              name: '',
              title: '',
              bio: '',
              location: '',
              timezone: '',
              email: currentUser.email || '',
              phone: '',
              technicalSkills: [],
              softSkills: [],
              languages: [],
              tools: [],
              experiences: [],
              education: [],
              projects: [],
              hackathons: [],
              links: {}
            });
          }
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
            technicalSkills: [],
            softSkills: [],
            languages: [],
            tools: [],
            experiences: [],
            education: [],
            projects: [],
            hackathons: [],
            links: {}
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
      setShowEditProfileModal(false);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    }
  };

  const handleCancelEdit = () => {
    setShowEditProfileModal(false);
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
        id: newSkills[activeSkillIndex].id,
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

  const FloatingParticles = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const particles: Particle[] = [];
      
      const resizeCanvas = () => {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1
        });
      }

      const animate = () => {
        if (!canvas || !ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;
          
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fill();
        });
        
        requestAnimationFrame(animate);
      };

      animate();

      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 opacity-30"
        style={{ background: 'transparent' }}
      ></canvas>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-3/4 right-1/2 w-64 h-64 bg-green-500/15 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
        {/* Profile Header */}
        <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden animate-fadeInUp border border-white/10">
          {/* Cover Photo Section */}
          <div className="relative w-full h-48 md:h-64 lg:h-80 bg-gradient-to-r from-purple-600/50 to-pink-600/50 group">
            {profileData.coverPhoto ? (
              <img
                src={profileData.coverPhoto}
                alt="Cover Photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg font-light bg-gradient-to-r from-purple-600/30 to-pink-600/30">No Cover Photo</div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
            {showEditProfileModal && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                <label
                  htmlFor="cover-upload"
                  className="flex items-center justify-center cursor-pointer px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white text-sm font-medium hover:bg-white/20 transition-colors mb-3"
                >
                  <CameraIcon className="w-5 h-5 mr-2" />
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
                {profileData.coverPhoto && (
                  <button
                    type="button"
                    onClick={() => handleDeleteImage('cover')}
                    className="flex items-center justify-center px-6 py-3 bg-red-500/20 backdrop-blur-sm rounded-xl text-white text-sm font-medium hover:bg-red-500/40 transition-colors"
                    disabled={uploadingImage}
                  >
                    <TrashIcon className="w-5 h-5 mr-2" />
                    Delete Cover Photo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Main content area below cover photo */}
          <div className="flex flex-col md:flex-row items-start justify-between px-8 py-6">
            {/* Left side: Profile Picture and Info */}
            <div className="flex flex-col items-start -mt-20 md:-mt-24 lg:-mt-32">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-800 shadow-2xl bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center group">
                {profileData.profilePicture ? (
                  <img
                    src={profileData.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-full h-full text-gray-600" style={{ transform: 'scale(1.5)' }} />
                )}
                {showEditProfileModal && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                    <label
                      htmlFor="profile-upload"
                      className="flex items-center justify-center cursor-pointer px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-colors mb-2"
                    >
                      <CameraIcon className="w-4 h-4 mr-2" />
                      Change Photo
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
                    {profileData.profilePicture && (
                      <button
                        type="button"
                        onClick={() => handleDeleteImage('profile')}
                        className="flex items-center justify-center px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-red-500/40 transition-colors"
                        disabled={uploadingImage}
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 text-left animate-fadeInUp delay-100">
                <h1 className="text-3xl font-bold text-white mb-1">
                  {profileData.name || (showEditProfileModal ? 'Your Name' : null)}
                </h1>
                {(profileData.title || showEditProfileModal) && (
                  <p className="text-xl text-purple-400 font-medium mb-2">
                    {profileData.title || (showEditProfileModal ? 'Add your title' : null)}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-gray-300 text-sm">
                  {(profileData.location || showEditProfileModal) && (
                    <div className="flex items-center animate-fadeInUp delay-200">
                      <svg className="w-4 h-4 mr-1 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profileData.location || (showEditProfileModal ? 'Add your location' : null)}
                    </div>
                  )}
                  {(profileData.timezone || showEditProfileModal) && (
                    <div className="flex items-center animate-fadeInUp delay-300">
                      <svg className="w-4 h-4 mr-1 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {profileData.timezone || (showEditProfileModal ? 'Add your timezone' : null)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Edit Profile Button */}
            {!userId && (
              <div className="flex-shrink-0 mt-4 md:mt-0 animate-fadeInUp delay-400">
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Edit Profile
                </button>
              </div>
            )}

            {userId && currentUser?.uid !== userId && (
              <div className="flex-shrink-0 mt-4 md:mt-0 animate-fadeInUp delay-400">
                <button
                  onClick={handleMessageClick}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Message
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Bio */}
            <GlowingCard className="animate-fadeInUp delay-500">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <UserCircleIcon className="h-6 w-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white ml-4">About</h2>
              </div>
              {showEditProfileModal ? (
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 hover:border-purple-500"
                  placeholder="Tell us about yourself"
                />
              ) : (
                profileData.bio ? (
                  <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                    {profileData.bio}
                  </p>
                ) : (
                  <p className="text-gray-500 text-lg">No bio provided.</p>
                )
              )}
            </GlowingCard>

            {/* Skills */}
            <GlowingCard className="animate-fadeInUp delay-600">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <CodeBracketIcon className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white ml-4">Skills</h2>
              </div>
              {showEditProfileModal ? (
                <div className="space-y-6">
                  {Object.entries(
                    (profileData.technicalSkills || []).reduce((acc: Record<string, Skill[]>, skill: Skill) => {
                      if (!acc[skill.category]) acc[skill.category] = [];
                      acc[skill.category].push(skill);
                      return acc;
                    }, {} as Record<string, Skill[]>)
                  ).map(([category, skills]) => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-300 capitalize">{category}</h3>
                      <div className="flex flex-wrap gap-3">
                        {(skills as Skill[]).map((skill: Skill, index: number) => (
                          <div
                            key={index}
                            className="group relative flex items-center px-4 py-2 bg-slate-700/30 border border-slate-600 rounded-xl focus-within:border-purple-500 transition-colors duration-200"
                          >
                            <input
                              type="text"
                              value={skillInputs[index] || skill.name}
                              onChange={(e) => handleSkillInputChange(e, index)}
                              className="bg-transparent text-white placeholder-gray-400 focus:outline-none w-full"
                              placeholder="Skill name"
                            />
                            <select
                              value={skill.proficiency}
                              onChange={(e) => {
                                const newSkills = [...profileData.technicalSkills];
                                newSkills[index].proficiency = e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'expert';
                                setProfileData((prev: UserProfileData) => ({ ...prev, technicalSkills: newSkills }));
                              }}
                              className="ml-2 bg-slate-800/50 text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 border border-slate-700 hover:border-purple-500 transition-colors duration-200"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="expert">Expert</option>
                            </select>
                            <button
                              onClick={() => {
                                const newSkills = profileData.technicalSkills.filter((_, i) => i !== index);
                                setProfileData((prev: UserProfileData) => ({ ...prev, technicalSkills: newSkills }));
                              }}
                              className="ml-2 text-gray-400 hover:text-red-400 transition-colors transform hover:scale-105"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newSkills = [...profileData.technicalSkills, {
                              id: crypto.randomUUID(),
                              name: '',
                              category: 'other' as const,
                              proficiency: 'beginner' as const
                            }];
                            setProfileData((prev: UserProfileData) => ({ ...prev, technicalSkills: newSkills }));
                          }}
                          className="flex items-center px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/30 transition-colors transform hover:scale-105"
                        >
                          <span className="mr-2">+</span> Add Skill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(
                    (profileData.technicalSkills || []).reduce((acc: Record<string, Skill[]>, skill: Skill) => {
                      if (!acc[skill.category]) acc[skill.category] = [];
                      acc[skill.category].push(skill);
                      return acc;
                    }, {} as Record<string, Skill[]>)
                  ).map(([category, skills]) => (
                    <div key={category}>
                      <h3 className="text-lg font-medium text-gray-300 capitalize mb-4">{category}</h3>
                      <div className="flex flex-wrap gap-3">
                        {(skills as Skill[]).map((skill: Skill, index: number) => (
                          <SkillBadge key={index} skill={skill} index={index} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlowingCard>

            {/* Experience */}
            <GlowingCard className="animate-fadeInUp delay-700">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <BriefcaseIcon className="h-6 w-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white ml-4">Experience</h2>
              </div>
              {showEditProfileModal ? (
                <div className="space-y-6">
                  {profileData.experiences.map((exp: Experience, index: number) => (
                    <div key={index} className="border border-slate-600 rounded-xl p-6 bg-slate-800/30 transition-all duration-300 hover:border-emerald-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...profileData.experiences];
                            newExp[index].company = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExp }));
                          }}
                          className="px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 hover:border-purple-500"
                          placeholder="Company"
                        />
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const newExp = [...profileData.experiences];
                            newExp[index].title = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExp }));
                          }}
                          className="px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 hover:border-purple-500"
                          placeholder="Title"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => {
                            const newExp = [...profileData.experiences];
                            newExp[index].startDate = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExp }));
                          }}
                          className="px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 hover:border-purple-500"
                        />
                        <input
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => {
                            const newExp = [...profileData.experiences];
                            newExp[index].endDate = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExp }));
                          }}
                          className="px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 hover:border-purple-500"
                        />
                      </div>
                      <textarea
                        value={exp.description}
                        onChange={(e) => {
                          const newExp = [...profileData.experiences];
                          newExp[index].description = e.target.value;
                          setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExp }));
                        }}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 focus:border-transparent transition-colors duration-200 hover:border-purple-500"
                        placeholder="Description"
                      />
                      <button
                        onClick={() => {
                          const newExp = profileData.experiences.filter((_, i) => i !== index);
                          setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExp }));
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors transform hover:scale-105"
                      >
                        Remove Experience
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newExp = [...profileData.experiences, {
                        id: Date.now().toString(),
                        title: '',
                        company: '',
                        startDate: '',
                        endDate: '',
                        description: '',
                        technologies: [],
                        type: 'work' as const
                      }];
                      setProfileData((prev: UserProfileData) => ({ ...prev, experiences: newExp }));
                    }}
                    className="flex items-center px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/30 transition-colors transform hover:scale-105"
                  >
                    <span className="mr-2">+</span> Add Experience
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {profileData.experiences.map((exp: Experience, index: number) => (
                    <ExperienceCard key={index} experience={exp} index={index} />
                  ))}
                </div>
              )}
            </GlowingCard>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Education */}
            <GlowingCard className="animate-fadeInUp delay-800">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-yellow-500/10 rounded-xl">
                  <AcademicCapIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white ml-4">Education</h2>
              </div>
              {showEditProfileModal ? (
                <div className="space-y-6">
                  {profileData.education.map((edu: Education, index: number) => (
                    <div key={index} className="border border-slate-600 rounded-xl p-6 bg-slate-800/30 transition-all duration-300 hover:border-yellow-500">
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const newEdu = [...profileData.education];
                          newEdu[index].institution = e.target.value;
                          setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                        }}
                        className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 focus:border-transparent transition-colors duration-200 hover:border-purple-500"
                        placeholder="Institution"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...profileData.education];
                            newEdu[index].degree = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                          }}
                          className="px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 hover:border-purple-500"
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
                          className="px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 hover:border-purple-500"
                          placeholder="Major"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => {
                            const newEdu = [...profileData.education];
                            newEdu[index].startDate = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                          }}
                          className="px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 hover:border-purple-500"
                        />
                        <input
                          type="date"
                          value={edu.endDate}
                          onChange={(e) => {
                            const newEdu = [...profileData.education];
                            newEdu[index].endDate = e.target.value;
                            setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                          }}
                          className="px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 hover:border-purple-500"
                        />
                      </div>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => {
                          const newEdu = [...profileData.education];
                          newEdu[index].gpa = e.target.value;
                          setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                        }}
                        className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 focus:border-transparent transition-colors duration-200 hover:border-purple-500"
                        placeholder="GPA"
                      />
                      <button
                        onClick={() => {
                          const newEdu = profileData.education.filter((_, i) => i !== index);
                          setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors transform hover:scale-105"
                      >
                        Remove Education
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newEdu = [...profileData.education, {
                        id: Date.now().toString(),
                        institution: '',
                        degree: '',
                        major: '',
                        startDate: '',
                        endDate: '',
                        gpa: '',
                        relevantCoursework: []
                      }];
                      setProfileData((prev: UserProfileData) => ({ ...prev, education: newEdu }));
                    }}
                    className="flex items-center px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/30 transition-colors transform hover:scale-105"
                  >
                    <span className="mr-2">+</span> Add Education
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {profileData.education.map((edu: Education, index: number) => (
                    <div key={index} className="border-l-4 border-yellow-500 pl-6 animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                      <h3 className="text-xl font-semibold text-white">{edu.institution}</h3>
                      <p className="text-lg text-gray-300">{edu.degree} in {edu.major}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(edu.startDate).toLocaleDateString()} - {new Date(edu.endDate).toLocaleDateString()}
                      </p>
                      {edu.gpa && (
                        <p className="mt-2 text-sm text-gray-300">GPA: {edu.gpa}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </GlowingCard>

            {/* Links */}
            <GlowingCard className="animate-fadeInUp delay-900">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-pink-500/10 rounded-xl">
                  <LinkIcon className="h-6 w-6 text-pink-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white ml-4">Links</h2>
              </div>
              {showEditProfileModal ? (
                <div className="space-y-4">
                  {Object.entries(profileData.links).map(([platform, url], index) => {
                    const typedUrl = url as string | string[];
                    return (
                      <div key={index} className="flex items-center gap-3 border border-slate-600 rounded-xl px-4 py-2 bg-slate-800/30 focus-within:border-purple-500 transition-colors duration-200">
                        <input
                          type="text"
                          value={typeof typedUrl === 'string' ? typedUrl : typedUrl[0]}
                          onChange={(e) => {
                            setProfileData((prev: UserProfileData) => ({
                              ...prev,
                              links: { ...prev.links, [platform]: e.target.value }
                            }));
                          }}
                          className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                          placeholder={`${platform} URL`}
                        />
                        <button
                          onClick={() => {
                            const newLinks = { ...profileData.links };
                            delete newLinks[platform as keyof typeof profileData.links];
                            setProfileData((prev: UserProfileData) => ({ ...prev, links: newLinks }));
                          }}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors transform hover:scale-105"
                        >
                          <XMarkIcon className="h-5 w-5" />
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
                    className="flex items-center px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/30 transition-colors transform hover:scale-105"
                  >
                    <span className="mr-2">+</span> Add Link
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(profileData.links).map(([platform, url], index) => {
                    const typedUrl = url as string | string[];
                    return (
                      <a
                        key={index}
                        href={typeof typedUrl === 'string' ? typedUrl : typedUrl[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-3 bg-slate-700/30 rounded-xl text-purple-400 hover:bg-slate-700/50 transition-colors transform hover:scale-105"
                      >
                        <span className="capitalize font-medium">{platform}</span>
                        <LinkIcon className="h-5 w-5 ml-2" />
                      </a>
                    );
                  })}
                </div>
              )}
            </GlowingCard>
          </div>
        </div>

        {/* Save Button */}
        {showEditProfileModal && (
          <div className="mt-12 flex justify-end animate-fadeInUp delay-1000">
            <button
              onClick={handleSubmit}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          
          .animate-fadeInUp.delay-100 {
            animation-delay: 0.1s;
          }
          .animate-fadeInUp.delay-200 {
            animation-delay: 0.2s;
          }
          .animate-fadeInUp.delay-300 {
            animation-delay: 0.3s;
          }
          .animate-fadeInUp.delay-400 {
            animation-delay: 0.4s;
          }
          .animate-fadeInUp.delay-500 {
            animation-delay: 0.5s;
          }
          .animate-fadeInUp.delay-600 {
            animation-delay: 0.6s;
          }
          .animate-fadeInUp.delay-700 {
            animation-delay: 0.7s;
          }
          .animate-fadeInUp.delay-800 {
            animation-delay: 0.8s;
          }
          .animate-fadeInUp.delay-900 {
            animation-delay: 0.9s;
          }
          .animate-fadeInUp.delay-1000 {
            animation-delay: 1.0s;
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          
          .animate-blob {
            animation: blob 7s infinite;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          
          .animation-delay-6000 {
            animation-delay: 6s;
          }
        `}
      </style>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-end p-4">
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="px-8 pb-8">
              <EditProfileForm
                initialData={profileData}
                onSave={handleSave}
                onCancel={handleCancelEdit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;