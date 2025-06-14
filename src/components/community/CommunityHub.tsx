import React, { useState } from 'react';
import BlogFeed from './BlogFeed';
import { BookOpenIcon } from '@heroicons/react/24/outline';

const CommunityHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'blogs' | 'community'>('blogs');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e0e7ff] via-[#f5f3ff] to-[#f0fdfa] flex flex-col items-center justify-start px-2 relative overflow-x-hidden">
      {/* Header */}
      <div className="w-full max-w-5xl mx-auto text-center mb-10 mt-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-transparent bg-clip-text mb-2">Welcome to HackHub Community</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Connect with fellow developers, share your projects, learn from the community, and discover the latest in tech. Your journey to innovation starts here.</p>
      </div>

      {/* Tab Bar */}
      
      {/* Main Glassy Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto mb-16 rounded-3xl shadow-2xl bg-white/70 backdrop-blur-2xl border border-white/30 flex flex-col items-stretch">
        <BlogFeed />
      </div>

      {/* Decorative Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-300/30 rounded-full filter blur-3xl opacity-60 animate-float -z-10" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-yellow-200/30 rounded-full filter blur-3xl opacity-60 animate-float -z-10" />
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-200/30 rounded-full filter blur-3xl opacity-60 animate-float -z-10" />
    </div>
  );
};

export default CommunityHub; 