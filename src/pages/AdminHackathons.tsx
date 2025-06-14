import React, { useState, useEffect } from 'react';
import { HackathonForm } from '../components/HackathonForm';
import { getAllHackathons, deleteHackathon, getHackathonStatus } from '../utils/hackathonUtils';
import { Hackathon } from '../utils/types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

export const AdminHackathons: React.FC = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingHackathon, setEditingHackathon] = useState<Hackathon | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [expandedHackathonId, setExpandedHackathonId] = useState<string | null>(null);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const all = await getAllHackathons();
      const hackathonsWithStatus = all.map(hackathon => ({
        ...hackathon,
        status: getHackathonStatus(hackathon)
      }));
      setHackathons(hackathonsWithStatus);
      setError(null);
    } catch (err) {
      console.error('Error fetching hackathons:', err);
      setError('Failed to fetch hackathons. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hackathon?')) {
      try {
        await deleteHackathon(id);
        fetchHackathons();
      } catch (err) {
        console.error('Error deleting hackathon:', err);
        setError('Failed to delete hackathon. Please try again.');
      }
    }
  };

  const handleEdit = (hackathon: Hackathon) => {
    setEditingHackathon(hackathon);
    setActiveTab('add');
  };

  const handleCancelEdit = () => {
    setEditingHackathon(undefined);
  };

  const toggleExpand = (id: string) => {
    setExpandedHackathonId(prevId => (prevId === id ? null : id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Admin Dashboard</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-6 flex justify-center space-x-4">
        <button
          onClick={() => {
            setActiveTab('add');
            setEditingHackathon(undefined);
          }}
          className={`py-2 px-6 rounded-md text-lg font-medium ${activeTab === 'add' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {editingHackathon ? 'Edit Hackathon' : 'Add New Hackathon'}
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`py-2 px-6 rounded-md text-lg font-medium ${activeTab === 'manage' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Manage Hackathons
        </button>
      </div>

      {activeTab === 'add' && (
        <HackathonForm onSuccess={() => { fetchHackathons(); setActiveTab('manage'); }} initialHackathon={editingHackathon} onCancelEdit={handleCancelEdit} />
      )}

      {activeTab === 'manage' && (
        <section className="mb-12 bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">All Hackathons</h2>
          {hackathons.length === 0 ? (
            <p className="text-gray-600 text-center">No hackathons added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="w-full bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6">Title</th>
                    <th className="py-3 px-6">Dates</th>
                    <th className="py-3 px-6">Location</th>
                    <th className="py-3 px-6">Platform</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {hackathons.map((hackathon) => (
                    <React.Fragment key={hackathon.id}>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6 text-left whitespace-nowrap">{hackathon.title}</td>
                        <td className="py-3 px-6 text-left">
                          {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-6 text-left">{hackathon.location}</td>
                        <td className="py-3 px-6 text-left">{hackathon.platform}</td>
                        <td className="py-3 px-6 text-left">
                          <span className={`py-1 px-3 rounded-full text-xs font-semibold ${hackathon.status === 'upcoming' ? 'bg-green-200 text-green-800'
                            : hackathon.status === 'ongoing' ? 'bg-blue-200 text-blue-800'
                              : 'bg-red-200 text-red-800'}`}>
                            {hackathon.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <div className="flex item-center justify-center">
                            <button onClick={() => handleEdit(hackathon)} className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                              ✏️
                            </button>
                            <button onClick={() => handleDelete(hackathon.id!)} className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                              🗑️
                            </button>
                            <button onClick={() => toggleExpand(hackathon.id!)} className="w-4 transform hover:text-purple-500 hover:scale-110">
                              {expandedHackathonId === hackathon.id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedHackathonId === hackathon.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-4 text-gray-700">
                              <div><strong>Description:</strong> {hackathon.description}</div>
                              <div><strong>Overview:</strong> {hackathon.overview}</div>
                              <div><strong>Eligibility:</strong> {hackathon.eligibility}</div>
                              <div><strong>Tech Stack:</strong> {hackathon.techStack.join(', ')}</div>
                              <div><strong>Timeline:</strong> {hackathon.timeline}</div>
                              <div><strong>Team Size:</strong> {hackathon.teamSize}</div>
                              <div><strong>Prize:</strong> {hackathon.prize}</div>
                              <div><strong>Domain:</strong> {hackathon.domain}</div>
                              <div className="col-span-2">
                                <strong>Registration Link:</strong> <a href={hackathon.registrationLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{hackathon.registrationLink}</a>
                              </div>
                              <div className="col-span-2">
                                <img src={hackathon.thumbnailUrl} alt="Thumbnail" className="w-32 h-32 object-cover rounded-md" />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default AdminHackathons; 