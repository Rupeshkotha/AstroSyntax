import React, { useState } from 'react';
import { Team } from '../utils/teamUtils';

interface EditTeamProps {
  team: Team;
  onSave: (updatedTeam: Team) => void;
  onCancel: () => void;
}

const EditTeam: React.FC<EditTeamProps> = ({ team, onSave, onCancel }) => {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description);
  const [hackathonName, setHackathonName] = useState(team.hackathonName);
  const [maxMembers, setMaxMembers] = useState(team.maxMembers);
  const [requiredSkills, setRequiredSkills] = useState(team.requiredSkills.join(', '));
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

    const skills = requiredSkills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    if (skills.length === 0) {
      setError('At least one required skill is needed');
      return;
    }

    const updatedTeam: Team = {
      ...team,
      name: name.trim(),
      description: description.trim(),
      hackathonName: hackathonName.trim(),
      maxMembers: Math.max(2, Math.min(10, maxMembers)),
      requiredSkills: skills,
    };

    onSave(updatedTeam);
  };

  return (
    <div className="card glass max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-6">Edit Team</h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error/20 text-error text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
              Team Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder="Enter team name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full h-24 resize-none"
              placeholder="Describe your team and project"
            />
          </div>

          <div>
            <label htmlFor="hackathonName" className="block text-sm font-medium text-text-secondary mb-1">
              Hackathon Name
            </label>
            <input
              type="text"
              id="hackathonName"
              value={hackathonName}
              onChange={(e) => setHackathonName(e.target.value)}
              className="input w-full"
              placeholder="Enter hackathon name"
            />
          </div>

          <div>
            <label htmlFor="maxMembers" className="block text-sm font-medium text-text-secondary mb-1">
              Maximum Team Size
            </label>
            <input
              type="number"
              id="maxMembers"
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value))}
              min="2"
              max="10"
              className="input w-full"
            />
            <p className="mt-1 text-xs text-text-secondary">
              Minimum: 2 members, Maximum: 10 members
            </p>
          </div>

          <div>
            <label htmlFor="requiredSkills" className="block text-sm font-medium text-text-secondary mb-1">
              Required Skills (comma-separated)
            </label>
            <input
              type="text"
              id="requiredSkills"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              className="input w-full"
              placeholder="e.g., React, Node.js, UI/UX Design"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-surface">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTeam; 