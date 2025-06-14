import React from 'react';

const features = [
  {
    name: 'Team Formation',
    description: 'Find the perfect teammates based on skills, interests, and availability.',
    icon: (
      <div className="bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 p-2 rounded-full shadow-lg">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 2a2 2 0 11-4 0 2 2 0 014 0zm-16 2a2 2 0 100-4 2 2 0 000 4z" /></svg>
      </div>
    ),
  },
  {
    name: 'AI Idea Generator',
    description: 'Get AI-powered project ideas and tech stack recommendations.',
    icon: (
      <div className="bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 p-2 rounded-full shadow-lg">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71m16.97 0l-.71-.71M4.05 4.93l-.71-.71M21 12h-1M4 12H3m9-9a9 9 0 100 18 9 9 0 000-18z" /></svg>
      </div>
    ),
  },
  {
    name: 'Presentation Builder',
    description: 'Create winning pitch decks with our AI-powered presentation tool.',
    icon: (
      <div className="bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 p-2 rounded-full shadow-lg">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 0v12m0-12l7.5 7.5M21 4l-7.5 7.5" /></svg>
      </div>
    ),
  },
  {
    name: 'Project Workspace',
    description: 'Collaborate in real-time with integrated tools and version control.',
    icon: (
      <div className="bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 p-2 rounded-full shadow-lg">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1h3" /></svg>
      </div>
    ),
  },
  {
    name: 'Mentor Connect',
    description: 'Get guidance from experienced mentors and industry experts.',
    icon: (
      <div className="bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 p-2 rounded-full shadow-lg">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0H6m6 0h6" /></svg>
      </div>
    ),
  },
  {
    name: 'Resource Bank',
    description: 'Access curated tutorials, templates, and best practices.',
    icon: (
      <div className="bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 p-2 rounded-full shadow-lg">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M12 4h9m-9 8h9m-9 4h9M3 4h.01M3 8h.01M3 12h.01M3 16h.01M3 20h.01" /></svg>
      </div>
    ),
  },
];

const Features: React.FC = () => {
  return (
    <section className="w-full py-24 bg-gradient-to-br from-white via-blue-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 text-center mb-16 drop-shadow-lg">Platform Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature) => (
            <div key={feature.name} className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center border border-blue-100 hover:scale-105 hover:shadow-2xl transition-transform duration-200">
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.name}</h3>
              <p className="text-gray-600 text-lg font-medium">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 