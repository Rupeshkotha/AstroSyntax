import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  TrophyIcon,
  UserGroupIcon,
  LightBulbIcon,
  SparklesIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BookOpenIcon,
  UserIcon,
  SpeakerWaveIcon,
  ArrowRightIcon,
  PlayIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const [typedText, setTypedText] = useState('');
  const [currentQuote, setCurrentQuote] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const taglines = [
    "Win Hackathons, Together.",
    "Connect, Collaborate, Conquer.",
    "Your Hub for Hackathon Success."
  ];

  const testimonials = [
    {
      text: "HackHub completely transformed my hackathon experience! Found the perfect team and won 3 hackathons this year.",
      author: "Sarah Chen",
      role: "Full-Stack Developer",
      rating: 5
    },
    {
      text: "The AI project idea generator is incredible. It suggested a winning concept that got us first place at TechCrunch!",
      author: "Alex Rodriguez",
      role: "ML Engineer",
      rating: 5
    },
    {
      text: "Finally, a platform that understands hackers. The team formation feature is pure genius!",
      author: "Maya Patel",
      role: "Product Designer",
      rating: 5
    }
  ];

  const features = [
    {
      title: 'Hackathons Discovery',
      description: 'Discover upcoming, ongoing, and recently ended hackathons with powerful filters. Never miss a hackathon again!',
      icon: <CalendarDaysIcon className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      delay: '0ms'
    },
    {
      title: 'Smart Team Formation',
      description: 'Create, join, or explore teams with AI-powered matching based on skills and interests.',
      icon: <UserGroupIcon className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      delay: '100ms'
    },
    {
      title: 'Project Workspace',
      description: 'Manage hackathon projects with integrated chat, task boards, file sharing, and progress tracking.',
      icon: <DocumentTextIcon className="w-8 h-8" />,
      delay: '200ms'
    },
    {
      title: 'AI Pitch Generator',
      description: 'Generate compelling 6-slide pitch decks from your ideas. Download as PDF or Google Slides.',
      icon: <ChartBarIcon className="w-8 h-8" />,
      color: 'from-emerald-500 to-teal-500',
      delay: '300ms'
    },
    {
      title: 'AI Idea Assistant',
      description: 'Get innovative project ideas, problem statements, and toolkits based on your domain expertise.',
      icon: <LightBulbIcon className="w-8 h-8" />,
      color: 'from-yellow-500 to-orange-500',
      delay: '400ms'
    },
    {
      title: 'Resources Hub',
      description: 'Access hackathon tips, APIs, curated repos, and "Build this in 24 hours" mini-guides.',
      icon: <BookOpenIcon className="w-8 h-8" />,
      color: 'from-indigo-500 to-purple-500',
      delay: '500ms'
    },
    {
      title: 'Profile Dashboard',
      description: 'Track participated hackathons, teams, project outcomes',
      icon: <UserIcon className="w-8 h-8" />,
      color: 'from-rose-500 to-pink-500',
      delay: '600ms'
    },
    {
      title: 'Community Hub',
      description: 'Stay connected with community events, team calls, and find teammates for upcoming hackathons.',
      icon: <SpeakerWaveIcon className="w-8 h-8" />,
      color: 'from-cyan-500 to-blue-500',
      delay: '700ms'
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const tagline = taglines[currentQuote];
    let i = 0;
    const timer = setInterval(() => {
      setTypedText(tagline.substring(0, i));
      i++;
      if (i > tagline.length) {
        setTimeout(() => {
          setCurrentQuote((prev) => (prev + 1) % taglines.length);
          setTypedText('');
        }, 2000);
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [currentQuote]);

  useEffect(() => {
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(testimonialTimer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
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

        <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-center mb-8 animate-bounce-slow">
            <div className="relative">
              <TrophyIcon className="w-20 h-20 text-yellow-400 mr-4 animate-pulse" />
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur opacity-30 animate-ping"></div>
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
                HackHub
              </span>
            </h1>
          </div>

          <div className="h-24 flex items-center justify-center mb-8">
            <p className="text-3xl md:text-4xl text-gray-300 font-light">
              {typedText}
              <span className="animate-pulse text-purple-400">|</span>
            </p>
          </div>

          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            The ultimate platform for hackathon enthusiasts. Discover events, form teams, get AI-powered project ideas, 
            and access everything you need to win hackathons together.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {currentUser ? (
              <Link to="/hackathons" className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105">
                <span className="relative flex items-center">
                  Find Hackathons
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ) : (
              <Link to="/signup" className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105">
                <span className="relative flex items-center">
                  Get Started Free
                  <SparklesIcon className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                </span>
              </Link>
            )}
            <Link to="/teams" className="group px-8 py-4 border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center">
                Create Team
                <UserGroupIcon className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
              </span>
            </Link>
            <Link to="/ideagenerator" className="group px-8 py-4 border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center">
                Get AI Ideas
                <LightBulbIcon className="w-5 h-5 ml-2 group-hover:animate-pulse transition-transform" />
              </span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {[
              { label: 'Active Hackers', value: '10K+' },
              { label: 'Hackathons Listed', value: '500+' },
              { label: 'Teams Formed', value: '2.5K+' },
              { label: 'Success Rate', value: '85%' }
            ].map((stat, index) => (
              <div key={index} className="text-center transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative">
        <div className="absolute inset-0 bg-gray-800 opacity-20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From discovering hackathons to forming teams, generating ideas, and creating winning pitches - 
              HackHub provides all the tools you need for hackathon success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                style={{ animationDelay: feature.delay }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color || 'from-purple-500 to-pink-500'} mb-6 transform group-hover:rotate-6 transition-transform duration-300`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16">
            Loved by <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Hackers</span> Worldwide
          </h2>
          
          <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            
            <div className="transition-all duration-500 transform">
              <blockquote className="text-2xl text-gray-300 mb-8 italic leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </blockquote>
              
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonials[currentTestimonial].author.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">{testimonials[currentTestimonial].author}</div>
                  <div className="text-gray-400 text-sm">{testimonials[currentTestimonial].role}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-32 bg-gradient-to-br from-slate-900 to-slate-800 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                See HackHub in <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Action</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Watch how HackHub transforms your hackathon journey from idea to victory. 
                Our platform guides you through every step of the process.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  'Discover perfect hackathons for your skills',
                  'Form teams with complementary expertise',
                  'Generate winning project ideas with AI',
                  'Create professional pitch decks instantly'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/demo" className="group flex items-center space-x-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-green-500/25">
                <PlayIcon className="w-6 h-6" />
                <span>Watch Demo</span>
              </Link>
            </div>
            
            <div className="relative">
              <div className="relative bg-slate-800 rounded-2xl p-8 border border-purple-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-slate-900 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-purple-500/30 rounded animate-pulse"></div>
                    <div className="h-4 bg-blue-500/30 rounded animate-pulse"></div>
                    <div className="h-4 bg-pink-500/30 rounded animate-pulse"></div>
                    <div className="h-8 bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded mt-6 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Ready to <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Win</span> Your Next Hackathon?
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of hackers who are already using HackHub to dominate hackathons. 
            Start your winning journey today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/signup" className="group relative px-12 py-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl shadow-2xl shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300 transform hover:scale-105">
              <span className="relative flex items-center">
                Start Winning Now
                <TrophyIcon className="w-6 h-6 ml-3 group-hover:rotate-12 transition-transform" />
              </span>
            </Link>
            
            <Link to="/hackathons" className="group px-12 py-5 border-2 border-white/30 text-white hover:bg-white hover:text-black font-bold rounded-xl transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center">
                Browse Hackathons
                <ArrowRightIcon className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;