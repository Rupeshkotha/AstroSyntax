import React, { useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface HackathonFiltersProps {
  onFilterChange: (filters: any) => void;
}

const techStackOptions = [
  'Python',
  'JavaScript',
  'React',
  'Node.js',
  'Solidity',
  'Rust',
  'Go',
  'Java',
  'C++',
  'TypeScript',
];

const durationOptions = [
  { value: '24', label: '24 hours' },
  { value: '48', label: '48 hours' },
  { value: '72', label: '72 hours' },
  { value: '1week', label: '1 week' },
  { value: '2weeks', label: '2 weeks' },
];

const platformOptions = [
  'Devpost',
  'Hackathon.io',
  'ETHGlobal',
  'MLH',
  'HackerEarth',
  'Hackathon.com',
];

const HackathonFilters: React.FC<HackathonFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    techStack: '',
    duration: '',
    platform: '',
    location: '',
    domain: '',
    status: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <FunnelIcon className="w-5 h-5 mr-2 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Filters</h2>
      </div>

      {/* Tech Stack Filter */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Tech Stack</h3>
        <select
          className="w-full bg-gray-700 border border-gray-600 rounded-md text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          name="techStack"
          value={filters.techStack}
          onChange={handleChange}
        >
          <option value="">Any Tech Stack</option>
          {techStackOptions.map((tech) => (
            <option key={tech} value={tech}>
              {tech}
            </option>
          ))}
        </select>
      </div>

      {/* Duration Filter */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Duration</h3>
        <select
          className="w-full bg-gray-700 border border-gray-600 rounded-md text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          name="duration"
          value={filters.duration}
          onChange={handleChange}
        >
          <option value="">Any Duration</option>
          {durationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Platform Filter */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Platform</h3>
        <select
          className="w-full bg-gray-700 border border-gray-600 rounded-md text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          name="platform"
          value={filters.platform}
          onChange={handleChange}
        >
          <option value="">Any Platform</option>
          {platformOptions.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Location</h3>
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleChange}
          className="w-full bg-gray-700 border border-gray-600 rounded-md text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., New York"
        />
      </div>

      {/* Domain Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Domain</h3>
        <input
          type="text"
          name="domain"
          value={filters.domain}
          onChange={handleChange}
          className="w-full bg-gray-700 border border-gray-600 rounded-md text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., AI/ML"
        />
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Status</h3>
        <select
          className="w-full bg-gray-700 border border-gray-600 rounded-md text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          name="status"
          value={filters.status}
          onChange={handleChange}
        >
          <option value="">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="past">Past</option>
        </select>
      </div>

      {/* Reset Filters Button */}
      <button
        className="w-full btn btn-secondary"
        onClick={() => {
          const resetFilters = { techStack: '', duration: '', platform: '', location: '', domain: '', status: '' };
          setFilters(resetFilters);
          onFilterChange(resetFilters);
        }}
      >
        Reset Filters
      </button>
    </div>
  );
};

export default HackathonFilters; 