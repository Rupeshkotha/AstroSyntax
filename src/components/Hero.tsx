import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative w-full min-h-[60vh] flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-pink-400/20 blur-2xl" />
      <div className="relative z-10 max-w-2xl w-full mx-auto rounded-3xl bg-white/70 backdrop-blur-lg shadow-2xl p-10 flex flex-col items-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6 drop-shadow-lg">
          Win Hackathons <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Together</span>
        </h1>
        <p className="max-w-xl text-xl text-gray-700 mb-10 font-medium">
          Find the perfect team, get AI-powered project ideas, and build winning hackathon projects with our collaborative platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold shadow-lg hover:from-blue-600 hover:to-pink-600 transition">Find Your Team</button>
          <button className="px-8 py-3 rounded-xl bg-white/80 border border-blue-200 text-blue-700 font-bold shadow hover:bg-blue-50 transition">Browse Hackathons</button>
        </div>
      </div>
    </section>
  );
};

export default Hero; 