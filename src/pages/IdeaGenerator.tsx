import React, { useState } from 'react';
import { LightBulbIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            AI Idea Generator
          </h1>
          <p className="text-gray-400 text-lg">
            Let AI help you discover innovative project ideas
          </p>
        </motion.div>

        {/* Mode Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-4"
        >
          {[
            { id: 'surprise', label: 'Surprise Me', icon: SparklesIcon },
            { id: 'guided', label: 'Based on Interests', icon: LightBulbIcon },
            { id: 'problem', label: 'I Have a Problem', icon: ArrowPathIcon }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id as Mode)}
              className={`group px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2
                ${mode === id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-gray-700'}`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </motion.div>

        {/* Input Fields */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700"
        >
          {mode === 'guided' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Technology</label>
                <input
                  type="text"
                  placeholder="e.g., AI, Blockchain, Web3"
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Field of Interest</label>
                <input
                  type="text"
                  placeholder="e.g., Health, Finance, Education"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-400">Theme</label>
                <input
                  type="text"
                  placeholder="e.g., Sustainability, Innovation, Social Impact"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
          )}

          {mode === 'problem' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Problem Statement</label>
              <textarea
                placeholder="Describe the problem you want to solve..."
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 min-h-[120px] resize-none"
              />
            </div>
          )}
        </motion.div>

        {/* Generate Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="group px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 
              bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 
              active:scale-95 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center gap-2"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <LightBulbIcon className="w-5 h-5 group-hover:animate-pulse" />
                Generate Ideas
              </>
            )}
          </button>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
          >
            {error}
          </motion.div>
        )}

        {/* Idea Cards */}
        <AnimatePresence>
          {ideas.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {ideas.map((idea, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    {idea.title}
                  </h3>
                  <p className="text-gray-300 mt-3">
                    <span className="text-gray-400">Problem:</span> {idea.problem}
                  </p>

                  <AnimatePresence>
                    {expandedIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-3 text-sm text-gray-300"
                      >
                        <div>
                          <span className="text-gray-400">Solution:</span> {idea.solution}
                        </div>
                        <div>
                          <span className="text-gray-400">Tech Stack:</span> {idea.techStack}
                        </div>
                        <div>
                          <span className="text-gray-400">Bonus Features:</span> {idea.bonus}
                        </div>
                        <div>
                          <span className="text-gray-400">Demo Plan:</span> {idea.demo}
                        </div>
                        <div>
                          <span className="text-gray-400">Target Audience:</span> {idea.audience}
                        </div>
                        <div>
                          <span className="text-gray-400">Difficulty:</span> {idea.difficulty}
                        </div>
                        <div>
                          <span className="text-gray-400">Resources:</span> {idea.resources}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  >
                    {expandedIndex === index ? 'Show less' : 'Read more'}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IdeaGenerator;
