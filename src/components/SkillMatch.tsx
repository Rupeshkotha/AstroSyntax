import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Team } from '../utils/teamUtils';
import { getUserProfileData, UserProfileData, Skill } from '../utils/firestoreUtils';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface SkillMatchProps {
  team: Team;
  onMatch: (userId: string) => void;
  onSkip: (userId: string) => void;
}

interface PotentialMember {
  id: string;
  name: string;
  avatar?: string;
  skills: Skill[];
  matchPercentage: number;
  title?: string;
  bio?: string;
}

const SkillMatch: React.FC<SkillMatchProps> = ({ team, onMatch, onSkip }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [potentialMembers, setPotentialMembers] = useState<PotentialMember[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!team.requiredSkills || team.requiredSkills.length === 0) {
      setError('This team has no required skills set. Please add required skills to find matching members.');
      setLoading(false);
      return;
    }
    loadPotentialMembers();
  }, [team]);

  const loadPotentialMembers = async () => {
    if (!currentUser) {
      setError('You must be logged in to find team members');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Get all users who are not already in the team
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      if (usersSnapshot.empty) {
        setError('No users found in the system');
        setLoading(false);
        return;
      }
      
      const potential: PotentialMember[] = [];
      
      for (const doc of usersSnapshot.docs) {
        const userData = doc.data() as UserProfileData;
        const userId = doc.id;
        
        // Skip if user is already in the team
        if (team.members.some(member => member.id === userId)) {
          continue;
        }
        
        // Skip if user is the current user
        if (userId === currentUser.uid) {
          continue;
        }
        
        // Skip if user has no skills
        if (!userData.technicalSkills || userData.technicalSkills.length === 0) {
          continue;
        }
        
        const userSkills = userData.technicalSkills;
        const matchingSkills = team.requiredSkills.filter(skill => 
          userSkills.some(userSkill => userSkill.name === skill)
        );
        
        const matchPercentage = (matchingSkills.length / team.requiredSkills.length) * 100;
        
        // Only include users with at least 30% skill match
        if (matchPercentage >= 30) {
          potential.push({
            id: userId,
            name: userData.name || 'Anonymous',
            avatar: userData.profilePicture,
            skills: userSkills,
            matchPercentage,
            title: userData.title,
            bio: userData.bio
          });
        }
      }
      
      if (potential.length === 0) {
        setError('No matching members found. Try adjusting the required skills or lowering the match threshold.');
        setLoading(false);
        return;
      }
      
      // Sort by match percentage
      potential.sort((a, b) => b.matchPercentage - a.matchPercentage);
      setPotentialMembers(potential);
    } catch (err) {
      console.error('Error loading potential members:', err);
      setError('Failed to load potential members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = () => {
    if (currentIndex < potentialMembers.length) {
      setDirection(1);
      onMatch(potentialMembers[currentIndex].id);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex < potentialMembers.length) {
      setDirection(-1);
      onSkip(potentialMembers[currentIndex].id);
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Finding potential team members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 text-xl mb-2">⚠️</div>
        <div className="text-red-500">{error}</div>
        {error.includes('no required skills') && (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Page
          </button>
        )}
      </div>
    );
  }

  if (currentIndex >= potentialMembers.length) {
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold mb-2">No More Matches</h3>
        <p className="text-gray-600">We've shown you all potential team members that match your required skills.</p>
        <button
          onClick={() => setCurrentIndex(0)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Start Over
        </button>
      </div>
    );
  }

  const currentMember = potentialMembers[currentIndex];
  const progress = ((currentIndex + 1) / potentialMembers.length) * 100;

  return (
    <div className="max-w-md mx-auto">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {currentIndex + 1} of {potentialMembers.length} potential members
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ 
            opacity: 0,
            x: direction * 100
          }}
          animate={{ 
            opacity: 1,
            x: 0
          }}
          exit={{ 
            opacity: 0,
            x: -direction * 100
          }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6">
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {currentMember.avatar ? (
                  <img
                    src={currentMember.avatar}
                    alt={currentMember.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {currentMember.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{currentMember.name}</h3>
                  {currentMember.title && (
                    <p className="text-gray-600">{currentMember.title}</p>
                  )}
                  <div className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {currentMember.matchPercentage.toFixed(0)}% Match
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/profile/${currentMember.id}`)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                View Profile
              </button>
            </div>

            {/* Bio */}
            {currentMember.bio && (
              <div className="mb-6">
                <p className="text-gray-600 italic">"{currentMember.bio}"</p>
              </div>
            )}

            {/* Skills Section */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Required Skills Match</h4>
              <div className="grid grid-cols-2 gap-2">
                {team.requiredSkills.map(skill => {
                  const userSkill = currentMember.skills.find(s => s.name === skill);
                  const proficiencyColors = {
                    beginner: 'bg-blue-100 text-blue-800',
                    intermediate: 'bg-green-100 text-green-800',
                    advanced: 'bg-purple-100 text-purple-800',
                    expert: 'bg-red-100 text-red-800'
                  };
                  
                  return (
                    <div
                      key={skill}
                      className={`p-3 rounded-lg ${
                        userSkill ? proficiencyColors[userSkill.proficiency] : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="font-medium">{skill}</div>
                      {userSkill && (
                        <div className="text-sm mt-1">
                          {userSkill.proficiency.charAt(0).toUpperCase() + userSkill.proficiency.slice(1)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4">
              <button
                onClick={handleSkip}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">✕</span>
                Skip
              </button>
              <button
                onClick={handleMatch}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-xl">✓</span>
                Match
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SkillMatch; 