import React, { useState } from 'react';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';

type Mode = 'surprise' | 'guided' | 'problem';

type Idea = {
  title: string;
  problem: string;
  solution: string;
  techStack: string;
  bonus: string;
  demo: string;
  audience: string;
  difficulty: string;
  resources: string;
};

const IdeaGenerator: React.FC = () => {
  const [mode, setMode] = useState<Mode>('surprise');
  const [technology, setTechnology] = useState('');
  const [interests, setInterests] = useState('');
  const [theme, setTheme] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [loading, setLoading] = useState(false);
  const [rawResult, setRawResult] = useState<string>('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseIdeas = (raw: string): Idea[] => {
    const ideaBlocks = raw.split(/Idea\s*\d+:/i).filter(Boolean);

    return ideaBlocks.map((block) => {
      const extract = (label: string) =>
        block.match(new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z][a-zA-Z /]+:|$)`, 'i'))?.[1].trim() || '';

      return {
        title: extract('Title'),
        problem: extract('Problem Statement'),
        solution: extract('Solution Overview'),
        techStack: extract('Suggested Tech Stack'),
        bonus: extract('Bonus Features / Enhancements'),
        demo: extract('Demo Plan'),
        audience: extract('Target Audience / Impact'),
        difficulty: extract('Difficulty / Experience Level'),
        resources: extract('Resources'),
      };
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setRawResult('');
    setError(null);
    setIdeas([]);
    setExpandedIndex(null);

    try {
      let payload: any = { mode };

      if (mode === 'guided') {
        payload.technology = technology;
        payload.interests = interests;
        payload.theme = theme;
      }

      if (mode === 'problem') {
        if (!problemStatement.trim()) {
          setError('Please enter a problem statement.');
          setLoading(false);
          return;
        }
        payload.problemStatement = problemStatement;
      }

      const response = await fetch('http://localhost:5000/api/idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.idea) {
        setRawResult(data.idea.trim());
        setIdeas(parseIdeas(data.idea));
      } else {
        setError(data.error || 'Failed to generate ideas.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong while generating ideas.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">✨ AI Idea Generator</h1>
          <p className="text-gray-600 mt-2">Craft tailored, high-impact project ideas instantly</p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-4">
        {['surprise', 'guided', 'problem'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m as Mode)}
            className={`px-5 py-2 rounded-full transition font-medium border shadow-sm
              ${mode === m
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md scale-105'
                : 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'}`}
          >
            {m === 'surprise' && 'Surprise Me'}
            {m === 'guided' && 'Based on Interests'}
            {m === 'problem' && 'I Have a Problem'}
          </button>
        ))}
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {mode === 'guided' && (
            <>
              <input
                type="text"
                placeholder="Technology (e.g., AI, Blockchain)"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                className="input"
              />
              <input
                type="text"
                placeholder="Field of Interest (e.g., Health, Finance)"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="input"
              />
              <input
                type="text"
                placeholder="Theme (e.g., Sustainability, Education)"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="input col-span-full"
              />
            </>
          )}

          {mode === 'problem' && (
            <textarea
              placeholder="Describe your problem statement here..."
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              className="input col-span-full min-h-[120px]"
            />
          )}
        </div>

        {/* Generate Button */}
        <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition 
            bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
            active:scale-95 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <LightBulbIcon className="w-5 h-5" />
          {loading ? 'Generating...' : 'Generate Ideas'}
        </button>
          {error && <p className="text-red-600 mt-3">{error}</p>}
        </div>

        {/* Idea Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ideas.map((idea, index) => (
            <div key={index} className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-bold text-blue-700">{idea.title}</h3>
              <p className="text-gray-800 mt-2">
                <strong className="text-gray-900">Problem:</strong> {idea.problem}
              </p>

              <AnimatePresence initial={false}>
                {expandedIndex === index && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-4 space-y-2 text-sm text-gray-700"
                  >
                    <p><strong>Solution:</strong> {idea.solution}</p>
                    <p><strong>Tech Stack:</strong> {idea.techStack}</p>
                    <p><strong>Bonus Features:</strong> {idea.bonus}</p>
                    <p><strong>Demo Plan:</strong> {idea.demo}</p>
                    <p><strong>Target Audience:</strong> {idea.audience}</p>
                    <p><strong>Difficulty:</strong> {idea.difficulty}</p>
                    <p><strong>Resources:</strong> {idea.resources}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                {expandedIndex === index ? 'Show less' : 'Read more'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IdeaGenerator;
