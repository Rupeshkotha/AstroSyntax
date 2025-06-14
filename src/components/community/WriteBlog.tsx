import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const TRACKS = [
  'GenAI',
  'Medicare',
  'Fintech',
  'Web3',
  'EdTech',
  'Sustainability',
  'IoT',
  'Gaming',
  'HealthTech',
  'Social Impact',
  'Open Innovation',
  'Cybersecurity',
  'AR/VR',
  'Robotics',
  'Mobility',
  'Smart Cities',
  'Others',
];

const WriteBlog: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [track, setTrack] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    console.log('WriteBlog: currentUser object', currentUser);
    console.log('WriteBlog: currentUser displayName:', currentUser.displayName);
    console.log('WriteBlog: currentUser photoURL:', currentUser.photoURL);

    try {
      setLoading(true);
      const blogData = {
        title,
        content,
        track,
        author: {
          id: currentUser.uid,
          name: currentUser.displayName || 'Anonymous User',
          photoURL: currentUser.photoURL,
        },
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0,
        likedBy: [],
      };

      await addDoc(collection(db, 'blogs'), blogData);
      navigate('/dashboard/community');
    } catch (error) {
      console.error('Error creating blog:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#7c3aed]">Create New Blog</h1>
              <p className="text-gray-500 mt-1">Share your thoughts with the community</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/community')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your blog title"
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="track" className="block text-sm font-medium text-gray-700 mb-2">
                Track
              </label>
              <select
                id="track"
                value={track}
                onChange={e => setTrack(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                required
              >
                <option value="" disabled>Select a track</option>
                {TRACKS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog content here..."
                className="w-full h-64 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard/community')}
                className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white rounded-lg font-semibold shadow hover:from-[#a78bfa] hover:to-[#7c3aed] transition-all"
              >
                {loading ? 'Publishing...' : 'Publish Blog'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WriteBlog; 