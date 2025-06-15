import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Team, TeamMember, createTeam, updateTeam, getTeam } from '../utils/teamUtils';
import { UserProfileData } from '../utils/firestoreUtils';
import { PencilIcon, XMarkIcon, PlusIcon, UserGroupIcon, SparklesIcon, ChatBubbleLeftIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface TeamFormProps {
  onSuccess?: () => void;
  initialData?: {
    id?: string;
    name: string;
    description: string;
    requiredSkills: string[];
    maxMembers: number;
    hackathonId?: string;
    hackathonName?: string;
    teamCode?: string;
    members?: TeamMember[];
    createdAt?: Date;
    createdBy?: string;
    joinRequests?: string[];
  };
  onSubmit: (team: Team) => void;
  onCancel: () => void;
  loading?: boolean;
}

const TeamForm: React.FC<TeamFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<Partial<Team>>({
    name: '',
    description: '',
    requiredSkills: [],
    maxMembers: 4,
    hackathonId: '',
    hackathonName: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [teamCode, setTeamCode] = useState('');
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (initialData) {
      console.log('Initializing form with data:', initialData);
      setFormData({
        name: initialData.name,
        description: initialData.description,
        requiredSkills: initialData.requiredSkills || [],
        maxMembers: initialData.maxMembers,
        hackathonId: initialData.hackathonId,
        hackathonName: initialData.hackathonName,
      });
      setTeamCode(initialData.teamCode || '');
    }
  }, [initialData]);

  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git',
    'UI/UX Design', 'Machine Learning', 'Data Science', 'DevOps', 'Mobile Development'
  ];

  useEffect(() => {
    if (skillInput) {
      const filtered = commonSkills.filter(skill =>
        skill.toLowerCase().includes(skillInput.toLowerCase())
      );
      setSkillSuggestions(filtered);
    } else {
      setSkillSuggestions([]);
    }
  }, [skillInput]);

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillInput(e.target.value);
  };

  const handleSkillSuggestionClick = (skill: string) => {
    console.log('Adding skill:', skill);
    setFormData(prev => {
      const currentSkills = prev.requiredSkills || [];
      if (!currentSkills.includes(skill)) {
        const newSkills = [...currentSkills, skill];
        console.log('New skills array:', newSkills);
        return {
          ...prev,
          requiredSkills: newSkills,
        };
      }
      return prev;
    });
    setSkillInput('');
    setSkillSuggestions([]);
  };

  const removeSkill = (skillToRemove: string) => {
    console.log('Removing skill:', skillToRemove);
    setFormData(prev => {
      const currentSkills = prev.requiredSkills || [];
      const newSkills = currentSkills.filter(skill => skill !== skillToRemove);
      console.log('New skills array after removal:', newSkills);
      return {
        ...prev,
        requiredSkills: newSkills,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('TeamForm: handleSubmit invoked.');
    e.preventDefault();

    if (isSubmittingRef.current) {
      console.log('TeamForm: Submission already in progress, preventing double submission.');
      return; // Prevent double submission
    }

    if (!currentUser) {
      setError('You must be logged in to create a team');
      return;
    }

    if (isHackathonPreselected) {
      if (!formData.hackathonId || !formData.hackathonName) {
        setError('Hackathon must be pre-filled.');
        return;
      }
    } else {
      if (!formData.hackathonName || !formData.hackathonName.trim()) {
        setError('Hackathon name is required.');
        return;
      }
    }

    isSubmittingRef.current = true;
    setError('');
    setIsFormSubmitting(true);

    try {
      console.log('TeamForm: Form data before submit:', formData);
      console.log('TeamForm: Initial data:', initialData);

      if (initialData && initialData.id) {
        const updates: Partial<Team> = {};
        
        if (formData.name) updates.name = formData.name;
        if (formData.description) updates.description = formData.description;
        if (formData.requiredSkills) {
          updates.requiredSkills = formData.requiredSkills;
        }
        if (formData.maxMembers) updates.maxMembers = formData.maxMembers;

        console.log('TeamForm: Attempting to update team with:', updates);
        await updateTeam(initialData.id, updates);
        console.log('TeamForm: Team updated successfully.');
        const updatedTeam = await getTeam(initialData.id);
        
        if (updatedTeam) {
          onSubmit(updatedTeam);
        } else {
          throw new Error('Failed to fetch updated team');
        }
      } else {
        const newTeamData: Partial<Team> = {
          name: formData.name || '',
          description: formData.description || '',
          requiredSkills: Array.isArray(formData.requiredSkills) ? formData.requiredSkills : [],
          maxMembers: typeof formData.maxMembers === 'number' ? formData.maxMembers : 4,
          hackathonId: formData.hackathonId || '',
          hackathonName: formData.hackathonName || '',
          members: [{
            id: currentUser.uid,
            name: currentUser.displayName || 'Anonymous',
            role: 'Team Lead',
            skills: [],
            ...(currentUser.photoURL ? { avatar: currentUser.photoURL } : {})
          }],
          createdAt: new Date(),
          createdBy: currentUser.uid,
          joinRequests: []
        };

        console.log('TeamForm: Attempting to create new team with data:', newTeamData);
        const teamId = await createTeam(newTeamData as Omit<Team, 'id' | 'teamCode'>);
        console.log('TeamForm: New team created with ID:', teamId);
        const newTeam = await getTeam(teamId);
        if (newTeam) {
          setTeamCode(newTeam.teamCode);
          onSubmit(newTeam);
        } else {
          throw new Error('Failed to fetch new team');
        }
      }
    } catch (err) {
      console.error('TeamForm: Error updating/creating team:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      console.log('TeamForm: Finally block entered.');
      setIsFormSubmitting(false);
      isSubmittingRef.current = false;
      console.log('TeamForm: isSubmittingRef reset to false.');
    }
  };

  const isHackathonPreselected = !!initialData?.hackathonId;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center space-x-3">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {teamCode && (
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-green-200">Team Code: {teamCode}</p>
              <p className="text-xs text-green-300 mt-1">Share this code with others to join your team</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="hackathonName" className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-purple-400" />
            <span>Hackathon Name</span>
          </label>
          <input
            type="text"
            id="hackathonName"
            value={formData.hackathonName || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, hackathonName: e.target.value }))}
            placeholder="Enter hackathon name"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
            required={!isHackathonPreselected}
            readOnly={isHackathonPreselected}
            disabled={isHackathonPreselected}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
            <UserGroupIcon className="w-4 h-4 text-purple-400" />
            <span>Team Name</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your team name"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
          <ChatBubbleLeftIcon className="w-4 h-4 text-purple-400" />
          <span>Description</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your team and project..."
          rows={3}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 resize-none"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
          <SparklesIcon className="w-4 h-4 text-purple-400" />
          <span>Required Skills</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="requiredSkills"
            value={skillInput}
            onChange={handleSkillInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && skillInput.trim()) {
                e.preventDefault();
                handleSkillSuggestionClick(skillInput.trim());
              }
            }}
            placeholder="Add required skills (e.g., React, Node.js)"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
          />
          {skillSuggestions.length > 0 && skillInput && (
            <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {skillSuggestions.map((skill) => (
                <li
                  key={skill}
                  className="px-4 py-2 hover:bg-purple-500/20 cursor-pointer text-gray-200 transition-colors duration-200"
                  onClick={() => handleSkillSuggestionClick(skill)}
                >
                  {skill}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.requiredSkills?.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
            >
              {skill}
              <button
                type="button"
                className="ml-2 -mr-0.5 h-4 w-4 rounded-full flex items-center justify-center text-purple-400 hover:text-white hover:bg-purple-500/50 transition-all duration-200"
                onClick={() => removeSkill(skill)}
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-300 flex items-center space-x-2">
          <UserGroupIcon className="w-4 h-4 text-purple-400" />
          <span>Maximum Team Size</span>
        </label>
        <input
          type="number"
          id="maxMembers"
          min="2"
          max="10"
          value={formData.maxMembers}
          onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
          placeholder="Enter maximum team size (2-10)"
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          Minimum: 2 members, Maximum: 10 members
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isFormSubmitting || loading}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isFormSubmitting || loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {initialData ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            initialData ? 'Update Team' : 'Create Team'
          )}
        </button>
      </div>
    </form>
  );
};

export default TeamForm;