import React, { useState } from 'react';

interface JoinTeamProps {
  onJoin: (teamCode: string) => void;
  onCancel: () => void;
}

const JoinTeam: React.FC<JoinTeamProps> = ({ onJoin, onCancel }) => {
  const [teamCode, setTeamCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!teamCode.trim()) {
      setError('Team code is required');
      return;
    }

    onJoin(teamCode.trim().toUpperCase());
  };

  return (
    <div className="card glass max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-6">Join Team</h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error/20 text-error text-sm">
              {error}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="teamCode" className="block text-sm font-medium text-text-secondary mb-1">
            Team Code
          </label>
          <input
            type="text"
            id="teamCode"
            value={teamCode}
            onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
            className="input w-full text-center tracking-widest font-mono text-lg"
            placeholder="Enter 6-digit code"
            maxLength={6}
          />
          <p className="mt-2 text-sm text-text-secondary">
            Enter the 6-digit team code provided by your team lead
          </p>
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
            Join Team
          </button>
        </div>
      </form>
    </div>
  );
};

export default JoinTeam;