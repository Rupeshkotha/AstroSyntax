import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Team, TeamMember, createTeam, updateTeam, getTeam } from '../utils/teamUtils';
import { UserProfileData } from '../utils/firestoreUtils';

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
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-lg">
      {error && (
        <div className="bg-red-900/50 text-red-200 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {teamCode && (
        <div className="bg-green-900/50 p-4 rounded-md">
          <p className="text-sm font-medium text-green-200">Team Code: {teamCode}</p>
          <p className="text-xs text-green-300 mt-1">Share this code with others to join your team</p>
        </div>
      )}

      <div>
        <label htmlFor="hackathonName" className="block text-base font-semibold text-gray-200 mb-2">
          Hackathon Name
        </label>
        <input
          type="text"
          id="hackathonName"
          value={formData.hackathonName || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, hackathonName: e.target.value }))}
          placeholder="Enter hackathon name"
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-200 text-base py-2.5 px-4 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required={!isHackathonPreselected}
          readOnly={isHackathonPreselected}
          disabled={isHackathonPreselected}
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-base font-semibold text-gray-200 mb-2">
          Team Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter your team name"
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-200 text-base py-2.5 px-4 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-base font-semibold text-gray-200 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your team and project..."
          rows={3}
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-200 text-base py-2.5 px-4 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="requiredSkills" className="block text-base font-semibold text-gray-200 mb-2">
          Required Skills
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
            className="input w-full"
          />
          {skillSuggestions.length > 0 && skillInput && (
            <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
              {skillSuggestions.map((skill) => (
                <li
                  key={skill}
                  className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-gray-200"
                  onClick={() => handleSkillSuggestionClick(skill)}
                >
                  {skill}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.requiredSkills?.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500 bg-opacity-20 text-blue-400"
            >
              {skill}
              <button
                type="button"
                className="ml-2 -mr-0.5 h-4 w-4 rounded-full flex items-center justify-center text-blue-400 hover:text-white"
                onClick={() => removeSkill(skill)}
              >
                <span className="sr-only">Remove skill</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="maxMembers" className="block text-base font-semibold text-gray-200 mb-2">
          Maximum Team Size
        </label>
        <input
          type="number"
          id="maxMembers"
          min="2"
          max="10"
          value={formData.maxMembers}
          onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
          placeholder="Enter maximum team size (2-10)"
          className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-200 text-base py-2.5 px-4 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
        <p className="text-xs text-text-secondary mt-1">
          Minimum: 2 members, Maximum: 10 members
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-700 bg-gray-800 px-5 py-2.5 text-base font-medium text-gray-200 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isFormSubmitting || loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-2.5 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
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