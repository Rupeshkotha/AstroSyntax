import React, { useState, useEffect } from 'react';
import { Announcement, getAnnouncements, getUserProfileData } from '../utils/firestoreUtils';
import { format } from 'date-fns';

interface TeamAnnouncementsProps {
  teamId: string;
}

const TeamAnnouncements: React.FC<TeamAnnouncementsProps> = ({ teamId }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = getAnnouncements(teamId, (fetchedAnnouncements) => {
      setAnnouncements(fetchedAnnouncements);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-400">Loading announcements...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">Error: {error}</div>;
  }

  return (
    <div className="space-y-4 p-4">
      {announcements.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No announcements yet. Be the first to share an update!
        </div>
      ) : (
        announcements.map((announcement) => (
          <div key={announcement.id} className="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-blue-400">{announcement.title}</h4>
              <span className="text-xs text-gray-400">
                {announcement.timestamp?.toDate ? format(announcement.timestamp.toDate(), 'MMM d, yyyy h:mm a') : 'Sending...'}
              </span>
            </div>
            <p className="text-gray-300 mb-2 whitespace-pre-wrap">{announcement.content}</p>
            <p className="text-sm text-gray-400 font-medium">- {announcement.senderName}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default TeamAnnouncements; 