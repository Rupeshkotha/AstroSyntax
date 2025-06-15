import React, { useState } from 'react';
import BlogFeed from './BlogFeed';
import { BookOpenIcon, UserGroupIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const CommunityHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'blogs' | 'community'>('blogs');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-start px-2 relative overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-3/4 right-1/2 w-64 h-64 bg-green-500/15 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="w-full max-w-5xl mx-auto text-center mb-10 mt-10 relative z-10">
        <div className="flex items-center justify-center mb-8 animate-bounce-slow">
          <div className="relative">
            <BookOpenIcon className="w-20 h-20 text-purple-400 mr-4 animate-pulse" />
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-30 animate-ping"></div>
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
              Community Hub
            </span>
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Discover insights and stories from the community
        </p>
      </div>

      {/* Main Glassy Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto mb-16 rounded-3xl shadow-2xl bg-slate-800/50 backdrop-blur-2xl border border-white/10 flex flex-col items-stretch">
        <BlogFeed />
      </div>
    </div>
  );
};

export default CommunityHub; 