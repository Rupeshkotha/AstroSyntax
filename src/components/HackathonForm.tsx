import React, { useState, useEffect } from 'react';
import { addHackathon, updateHackathon } from '../utils/hackathonUtils';
import { Hackathon } from '../utils/types';

interface HackathonFormProps {
  onSuccess?: () => void;
  initialHackathon?: Hackathon;
  onCancelEdit?: () => void;
}

export const HackathonForm: React.FC<HackathonFormProps> = ({ onSuccess, initialHackathon, onCancelEdit }) => {
  const initialFormData: Omit<Hackathon, 'id'> = {
    title: '',
    description: '',
    overview: '',
    eligibility: '',
    techStack: [],
    timeline: '',
    teamSize: '',
    prize: '',
    startDate: '',
    endDate: '',
    location: '',
    platform: '',
    domain: '',
    registrationLink: '',
    status: 'upcoming',
    thumbnailUrl: ''
  };

  const [formData, setFormData] = useState<Omit<Hackathon, 'id'>>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialHackathon) {
      setFormData({
        ...initialHackathon,
        startDate: initialHackathon.startDate.split('T')[0] + 'T' + initialHackathon.startDate.split('T')[1].substring(0,5),
        endDate: initialHackathon.endDate.split('T')[0] + 'T' + initialHackathon.endDate.split('T')[1].substring(0,5),
      });
    } else {
      setFormData(initialFormData);
    }
  }, [initialHackathon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (initialHackathon && initialHackathon.id) {
        await updateHackathon(initialHackathon.id, formData);
      } else {
        await addHackathon({
          ...formData,
          status: 'upcoming'
        });
      }
      
      onSuccess?.();
      setFormData(initialFormData);
    } catch (err) {
      setError('Failed to save hackathon. Please try again.');
      console.error('Error saving hackathon:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTechStackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, techStack: value.split(',').map(tech => tech.trim()) }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-xl border border-gray-200">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">{initialHackathon ? 'Edit Hackathon' : 'Add New Hackathon'}</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="thumbnailUrl" className="block text-sm font-semibold text-gray-700 mb-1">Thumbnail URL</label>
          <input
            type="url"
            id="thumbnailUrl"
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">Short Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="overview" className="block text-sm font-semibold text-gray-700 mb-1">Overview (Detailed Description)</label>
          <textarea
            id="overview"
            name="overview"
            value={formData.overview}
            onChange={handleChange}
            required
            rows={6}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="eligibility" className="block text-sm font-semibold text-gray-700 mb-1">Eligibility</label>
          <textarea
            id="eligibility"
            name="eligibility"
            value={formData.eligibility}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="platform" className="block text-sm font-semibold text-gray-700 mb-1">Platform</label>
          <input
            type="text"
            id="platform"
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="domain" className="block text-sm font-semibold text-gray-700 mb-1">Domain</label>
          <input
            type="text"
            id="domain"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="timeline" className="block text-sm font-semibold text-gray-700 mb-1">Timeline (e.g., 48 hours)</label>
          <input
            type="text"
            id="timeline"
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="teamSize" className="block text-sm font-semibold text-gray-700 mb-1">Team Size (e.g., 2-4 members)</label>
          <input
            type="text"
            id="teamSize"
            name="teamSize"
            value={formData.teamSize}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="prize" className="block text-sm font-semibold text-gray-700 mb-1">Prize (e.g., $10,000)</label>
          <input
            type="text"
            id="prize"
            name="prize"
            value={formData.prize}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="techStack" className="block text-sm font-semibold text-gray-700 mb-1">Tech Stack (comma-separated)</label>
          <input
            type="text"
            id="techStack"
            name="techStack"
            value={formData.techStack.join(', ')}
            onChange={handleTechStackChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="registrationLink" className="block text-sm font-semibold text-gray-700 mb-1">Registration Link</label>
          <input
            type="url"
            id="registrationLink"
            name="registrationLink"
            value={formData.registrationLink}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out text-gray-900"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        {initialHackathon && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Cancel Edit
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {loading ? 'Saving...' : (initialHackathon ? 'Update Hackathon' : 'Add Hackathon')}
        </button>
      </div>
    </form>
  );
}; 