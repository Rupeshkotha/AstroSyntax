import React, { useState } from 'react';
import { Team } from '../utils/teamUtils';

interface CreateTeamProps {
  onCreateTeam: (team: Team) => void;
  onCancel: () => void;
}

const CreateTeam: React.FC<CreateTeamProps> = ({ onCreateTeam, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hackathonName, setHackathonName] = useState('');
  const [hackathonId, setHackathonId] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [requiredSkills, setRequiredSkills] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Team name is required');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!hackathonName.trim()) {
      setError('Hackathon name is required');
      return;
    }

    if (!hackathonId.trim()) {
      setError('Hackathon ID is required');
      return;
    }

    const skills = requiredSkills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    if (skills.length === 0) {
      setError('At least one required skill is needed');
      return;
    }

    const newTeam: Team = {
      id: '',
      name: name.trim(),
      description: description.trim(),
      hackathonName: hackathonName.trim(),
      hackathonId: hackathonId.trim(),
      createdBy: '',
      createdAt: new Date(),
      maxMembers: Math.max(2, Math.min(10, maxMembers)),
      requiredSkills: skills,
      members: [],
      joinRequests: [],
      teamCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    };

    onCreateTeam(newTeam);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="card glass backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold gradient-text">Create New Team</h2>
                  <p className="text-text-secondary mt-2">Fill in the details to create your dream team</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-error/20 border border-error/30 text-error flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-text-secondary">
                      Team Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input w-full pl-10"
                        placeholder="Enter team name"
                      />
                      <svg className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="hackathonName" className="block text-sm font-medium text-text-secondary">
                      Hackathon Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="hackathonName"
                        value={hackathonName}
                        onChange={(e) => setHackathonName(e.target.value)}
                        className="input w-full pl-10"
                        placeholder="Enter hackathon name"
                      />
                      <svg className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-text-secondary">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input w-full h-32 resize-none"
                    placeholder="Describe your team and project goals..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="hackathonId" className="block text-sm font-medium text-text-secondary">
                      Hackathon ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="hackathonId"
                        value={hackathonId}
                        onChange={(e) => setHackathonId(e.target.value)}
                        className="input w-full pl-10"
                        placeholder="Enter hackathon ID"
                      />
                      <svg className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="maxMembers" className="block text-sm font-medium text-text-secondary">
                      Team Size
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="maxMembers"
                        value={maxMembers}
                        onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                        min="2"
                        max="10"
                        className="input w-full pl-10"
                      />
                      <svg className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Minimum: 2 members, Maximum: 10 members
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="requiredSkills" className="block text-sm font-medium text-text-secondary">
                    Required Skills
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="requiredSkills"
                      value={requiredSkills}
                      onChange={(e) => setRequiredSkills(e.target.value)}
                      className="input w-full pl-10"
                      placeholder="e.g., React, Node.js, UI/UX Design"
                    />
                    <svg className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Separate skills with commas
                  </p>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-surface">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-outline hover:bg-surface/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Create Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam; 