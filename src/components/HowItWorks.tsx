import React from 'react';

const steps = [
  {
    title: 'Sign Up',
    description: 'Create your free HackHub account in seconds.',
    icon: (
      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM3 21v-1a4 4 0 014-4h10a4 4 0 014 4v1" /></svg>
    ),
  },
  {
    title: 'Find a Team',
    description: 'Match with teammates based on skills and interests.',
    icon: (
      <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 2a2 2 0 11-4 0 2 2 0 014 0zm-16 2a2 2 0 100-4 2 2 0 000 4z" /></svg>
    ),
  },
  {
    title: 'Build & Collaborate',
    description: 'Use our workspace and tools to build your project.',
    icon: (
      <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
    ),
  },
  {
    title: 'Win Hackathons',
    description: 'Present your project and win with your team!',
    icon: (
      <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 17.75V19m0 0v2m0-2h-2m2 0h2m-2-2a7 7 0 100-14 7 7 0 000 14z" /></svg>
    ),
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="w-full py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 text-center mb-16 drop-shadow-lg">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {steps.map((step, idx) => (
            <div key={step.title} className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl shadow-xl p-8 flex flex-col items-center text-center border border-blue-100">
              <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{`${idx + 1}. ${step.title}`}</h3>
              <p className="text-gray-600 text-base font-medium">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 