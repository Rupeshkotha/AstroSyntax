import React from 'react';

const CallToAction: React.FC = () => {
  return (
    <section className="w-full py-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex justify-center items-center">
      <div className="max-w-2xl w-full mx-auto text-center text-white">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 drop-shadow-lg">
          Ready to win your next hackathon?
        </h2>
        <p className="text-lg mb-8 font-medium opacity-90">
          Join HackHub today and start building with the best teams, tools, and mentors.
        </p>
        <button className="px-10 py-4 rounded-2xl bg-white text-blue-600 font-bold text-lg shadow-xl hover:bg-blue-50 transition">
          Get Started Now
        </button>
      </div>
    </section>
  );
};

export default CallToAction; 