import React, { useState, useEffect } from 'react';
import {
  BookOpenIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  SparklesIcon,
  CommandLineIcon,
  BeakerIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  PuzzlePieceIcon,
  ArrowRightIcon,
  TrophyIcon,
  FireIcon,
  LightBulbIcon,
  ClockIcon,
  BoltIcon,
  StarIcon,
  HeartIcon,
  ChartBarIcon,
  CpuChipIcon,
  GlobeAltIcon,
  MegaphoneIcon,
  CameraIcon,
  PlayIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  CalendarIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  HandRaisedIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

// Type definitions
interface GuideSection {
  title: string;
  content: string[];
}

interface HackathonGuide {
  title: string;
  description: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  sections: GuideSection[];
}

interface Tool {
  name: string;
  description: string;
  useCases: string[];
  alternatives: string[];
  resources: string[];
}

interface ToolCategory {
  category: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  tools: Tool[];
}

interface Project {
  title: string;
  tech: string[];
  features: string[];
  resources: string[];
}

interface HackathonTrack {
  level: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  description: string;
  projects: Project[];
}

interface QuickGuide {
  title: string;
  time: string;
  difficulty: string;
  tech: string[];
  steps: string[];
  resources: string[];
}

interface AIApproach {
  type: string;
  tools: string[];
  useCases: string[];
}

// Base interfaces
interface BaseContent {
  title: string;
  description?: string;
}

interface PhaseContent extends BaseContent {
  type: 'phase';
  items: string[];
}

interface StructureContent extends BaseContent {
  type: 'structure';
  items: string[];
}

type SectionContent = PhaseContent | StructureContent;

interface Section {
  title: string;
  content: SectionContent;
}

interface Strategy {
  name: string;
  description: string;
  framework?: string;
  examples?: string[];
  validation?: string[];
  stack?: {
    frontend: string[];
    backend: string[];
    ai: string[];
    mobile: string[];
  };
  deployment?: string[];
  debugging?: string[];
  approaches?: AIApproach[];
  bestPractices?: string[];
}

interface Trend {
  name: string;
  description: string;
  opportunities: string[];
  impact?: string;
  resources?: string[];
}

interface TrendSection {
  title: string;
  trends: Trend[];
}

interface Category {
  category: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  trends: Trend[];
}

const DEFAULT_SECTION_CONTENT: SectionContent = {
  type: 'structure',
  title: 'Default Section',
  items: []
};

const Resources: React.FC = () => {
  const [activeTab, setActiveTab] = useState('mindset');
  const [typedText, setTypedText] = useState('');
  const [currentQuote, setCurrentQuote] = useState(0);
  const [toolkitError, setToolkitError] = useState<string | null>(null);

  const handleToolkitDownload = () => {
    setToolkitError(null);
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = '/hackathon-toolkit.zip';
      link.download = 'hackathon-toolkit.zip';
      
      // Add error handling for the download
      link.onerror = () => {
        setToolkitError('Toolkit is currently being updated. Please check back soon!');
      };
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setToolkitError('Unable to download toolkit. Please try again later.');
    }
  };

  const inspirationalQuotes = [
    "The best way to predict the future is to create it.",
    "Every expert was once a beginner.",
    "Innovation distinguishes between a leader and a follower.",
    "The only impossible journey is the one you never begin."
  ];

  useEffect(() => {
    const quote = inspirationalQuotes[currentQuote];
    let i = 0;
    const timer = setInterval(() => {
      setTypedText(quote.substring(0, i));
      i++;
      if (i > quote.length) {
        setTimeout(() => {
          setCurrentQuote((prev) => (prev + 1) % inspirationalQuotes.length);
          setTypedText('');
        }, 2000);
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [currentQuote]);

  const hackathonMindset = [
    {
      title: "The Hackathon Mindset",
      description: "What separates winners from participants",
      icon: FireIcon,
      content: {
        principles: [
          {
            title: "Think Big, Start Small",
            description: "Dream of changing the world, but start with a single problem you can solve in 48 hours",
            tip: "Start with a simple MVP that demonstrates your core idea"
          },
          {
            title: "Fail Fast, Learn Faster",
            description: "Every bug is a lesson, every setback is setup for a comeback",
            tip: "Timebox your experiments - if it doesn't work in 2 hours, pivot"
          },
          {
            title: "Collaboration Over Competition",
            description: "Your biggest competitor is time, not other teams",
            tip: "Help other teams when you can - karma comes back in hackathons"
          },
          {
            title: "Story > Code",
            description: "Judges remember compelling stories, not perfect code",
            tip: "Spend 30% of your time on presentation and storytelling"
          }
        ],
        psychology: {
          title: "The Psychology of Winning",
          insights: [
            "Winners spend 20% more time on problem validation",
            "Successful teams prototype 3x faster than others",
            "Top projects always have a clear user journey",
            "Winning presentations follow the problem-solution-impact structure"
          ]
        }
      }
    },
    {
      title: "The Hackathon Journey",
      description: "From idea to victory - the complete playbook",
      icon: TrophyIcon,
      content: {
        phases: [
          {
            phase: "Pre-Hackathon (1 week before)",
            duration: "5-10 hours",
            activities: [
              "Research past winners and judge preferences",
              "Set up development environment and templates",
              "Practice your 2-minute elevator pitch",
              "Connect with potential teammates on Discord/Slack",
              "Study the sponsor APIs and tools"
            ],
            proTip: "Create a 'Hackathon Starter Kit' with boilerplate code for different project types"
          },
          {
            phase: "Day 0 - Opening & Team Formation",
            duration: "3-4 hours",
            activities: [
              "Attend opening ceremony and sponsor talks",
              "Network during team formation sessions",
              "Validate your team's skill balance",
              "Brainstorm and finalize your project idea",
              "Set up communication channels and tools"
            ],
            proTip: "Join a team that's missing your skills, not one that duplicates them"
          },
          {
            phase: "Day 1 - Build Sprint",
            duration: "16-18 hours",
            activities: [
              "Create detailed project roadmap with milestones",
              "Set up version control and deployment pipeline",
              "Build core functionality first",
              "Test early and often",
              "Document your progress with screenshots"
            ],
            proTip: "Deploy a working demo by hour 12, even if it's basic"
          },
          {
            phase: "Day 2 - Polish & Present",
            duration: "8-10 hours",
            activities: [
              "Refine UI/UX and fix critical bugs",
              "Create compelling demo script",
              "Design presentation slides",
              "Practice pitch multiple times",
              "Prepare for Q&A session"
            ],
            proTip: "Record a backup demo video in case of technical difficulties"
          }
        ]
      }
    }
  ];

  const advancedStrategies = [
    {
      category: "Ideation & Validation",
      icon: LightBulbIcon,
      strategies: [
        {
          name: "The Problem-First Approach",
          description: "Start with a problem you've personally experienced",
          framework: "Personal Problem → Market Research → Solution Design → MVP",
          examples: [
            "Student struggles with course scheduling → AI-powered timetable optimizer",
            "Difficulty finding study groups → Location-based study buddy matcher",
            "Food waste in dorms → Peer-to-peer food sharing app"
          ],
          validation: [
            "Survey 10 people about the problem",
            "Research existing solutions and their gaps",
            "Define your unique value proposition"
          ]
        },
        {
          name: "The Sponsor-Tech Approach",
          description: "Leverage sponsor APIs and tools strategically",
          framework: "Sponsor Challenge → API Exploration → Creative Use Case → Implementation",
          examples: [
            "AWS Challenge → Use ML services for accessibility tools",
            "Google Cloud → Implement real-time translation for communities",
            "Microsoft Azure → Build cognitive services for education"
          ],
          validation: [
            "Study sponsor judging criteria",
            "Test API limits and capabilities",
            "Prepare sponsor-specific demo"
          ]
        },
        {
          name: "The Trend-Jacking Approach",
          description: "Ride the wave of current tech trends",
          framework: "Current Trend → Underserved Niche → Rapid Prototype → Market Entry",
          examples: [
            "AI Boom → AI for mental health support",
            "Sustainability Focus → Carbon footprint gamification",
            "Remote Work → Virtual team building experiences"
          ],
          validation: [
            "Research trend adoption curves",
            "Identify underserved segments",
            "Create compelling future vision"
          ]
        }
      ]
    },
    {
      category: "Technical Excellence",
      icon: CpuChipIcon,
      strategies: [
        {
          name: "The Full-Stack Speedrun",
          description: "Rapidly deploy end-to-end solutions",
          stack: {
            frontend: ["Next.js", "Tailwind", "Vercel"],
            backend: ["Supabase", "Firebase", "Railway"],
            ai: ["OpenAI API", "Hugging Face", "Replicate"],
            mobile: ["React Native", "Expo", "Flutter"]
          },
          deployment: [
            "Use pre-built templates and starters",
            "Implement CI/CD from day one",
            "Monitor performance and uptime",
            "Have staging and production environments"
          ],
          debugging: [
            "Use browser dev tools effectively",
            "Implement comprehensive logging",
            "Set up error tracking (Sentry)",
            "Test on multiple devices/browsers"
          ]
        },
        {
          name: "The AI Integration Mastery",
          description: "Leverage AI to create magical user experiences",
          approaches: [
            {
              type: "Conversational AI",
              tools: ["OpenAI GPT", "Anthropic Claude", "Cohere"],
              useCases: ["Chatbots", "Content generation", "Code assistance"]
            },
            {
              type: "Computer Vision",
              tools: ["OpenCV", "TensorFlow.js", "MediaPipe"],
              useCases: ["Object detection", "Face recognition", "AR filters"]
            },
            {
              type: "Data Analysis",
              tools: ["Pandas", "NumPy", "Plotly"],
              useCases: ["Insights generation", "Predictive analytics", "Visualization"]
            }
          ],
          bestPractices: [
            "Always have fallback options for AI failures",
            "Implement proper rate limiting and error handling",
            "Consider privacy and ethical implications",
            "Test with edge cases and unexpected inputs"
          ]
        }
      ]
    }
  ];

  const pitchingMastery = [
    {
      title: "The Perfect Pitch Structure",
      icon: MicrophoneIcon,
      content: {
        structure: [
          {
            section: "Hook (15 seconds)",
            purpose: "Grab attention immediately",
            techniques: [
              "Start with a surprising statistic",
              "Ask a thought-provoking question",
              "Share a personal anecdote",
              "Demonstrate the problem live"
            ],
            examples: [
              "'Raise your hand if you've ever felt lost in a new city' - for navigation app",
              "'Every minute, 300 hours of video are uploaded to YouTube' - for content discovery",
              "'I've been rejected from 47 job applications' - for resume optimization tool"
            ]
          },
          {
            section: "Problem (30 seconds)",
            purpose: "Establish pain point and market size",
            techniques: [
              "Use relatable scenarios",
              "Quantify the problem's impact",
              "Show current solution gaps",
              "Create emotional connection"
            ],
            examples: [
              "Show frustrated user struggling with current solutions",
              "Present market research and user surveys",
              "Demonstrate inefficiencies in existing workflows"
            ]
          },
          {
            section: "Solution (45 seconds)",
            purpose: "Present your innovation clearly",
            techniques: [
              "Focus on unique value proposition",
              "Explain the 'aha' moment",
              "Show, don't just tell",
              "Highlight key differentiators"
            ],
            examples: [
              "Live demo of core functionality",
              "Before/after comparison",
              "User journey walkthrough"
            ]
          },
          {
            section: "Impact (20 seconds)",
            purpose: "Prove scalability and importance",
            techniques: [
              "Present potential market size",
              "Share early user feedback",
              "Discuss social/business impact",
              "Outline growth strategy"
            ],
            examples: [
              "User testimonials or survey results",
              "Market penetration projections",
              "Social good measurements"
            ]
          },
          {
            section: "Call to Action (10 seconds)",
            purpose: "Leave lasting impression",
            techniques: [
              "Invite judges to try the product",
              "Request specific next steps",
              "Share memorable tagline",
              "Express gratitude genuinely"
            ],
            examples: [
              "'Try it now at [demo-link]'",
              "'We'd love your feedback on our beta'",
              "'Join us in making [vision] a reality'"
            ]
          }
        ],
        advanced_techniques: [
          {
            name: "The Storytelling Arc",
            description: "Structure your pitch like a compelling story",
            elements: ["Hero (user)", "Villain (problem)", "Mentor (your solution)", "Transformation (impact)"]
          },
          {
            name: "The Demo Sandwich",
            description: "Wrap your demo with context and impact",
            structure: "Setup → Live Demo → Results/Impact"
          },
          {
            name: "The Judge Psychology",
            description: "Understand what judges are really evaluating",
            criteria: ["Technical innovation", "Market potential", "Team execution", "Presentation quality"]
          }
        ]
      }
    },
    {
      title: "Presentation Design That Wins",
      icon: PaintBrushIcon,
      content: {
        design_principles: [
          {
            principle: "Visual Hierarchy",
            description: "Guide the judge's eye through your content",
            techniques: [
              "Use size, color, and spacing strategically",
              "Limit to 3 fonts maximum",
              "Follow the F-pattern for slide layout",
              "Use high contrast for readability"
            ]
          },
          {
            principle: "Cognitive Load",
            description: "Keep slides simple and focused",
            techniques: [
              "One main idea per slide",
              "Maximum 7 words per bullet point",
              "Use visuals over text when possible",
              "Implement the 6x6 rule (max 6 bullets, 6 words each)"
            ]
          },
          {
            principle: "Emotional Connection",
            description: "Create slides that evoke feelings",
            techniques: [
              "Use authentic user photos",
              "Include personal stories",
              "Show genuine problem scenarios",
              "Use color psychology effectively"
            ]
          }
        ],
        slide_templates: [
          {
            type: "Problem Slide",
            elements: ["Compelling headline", "Supporting statistic", "Relatable image", "Personal connection"]
          },
          {
            type: "Solution Slide",
            elements: ["Clear value proposition", "Key features overview", "Differentiation points", "User benefit focus"]
          },
          {
            type: "Demo Slide",
            elements: ["Screenshot or GIF", "Key functionality callouts", "User flow arrows", "Result highlights"]
          },
          {
            type: "Impact Slide",
            elements: ["Metrics and numbers", "User testimonials", "Market opportunity", "Future vision"]
          }
        ]
      }
    }
  ];

  const communitySecrets = [
    {
      title: "The Hidden Hackathon Economy",
      icon: BanknotesIcon,
      insights: [
        {
          secret: "Sponsor Relationships",
          description: "Building long-term relationships with sponsors can lead to job opportunities",
          tactics: [
            "Connect with sponsor representatives on LinkedIn",
            "Ask thoughtful questions during sponsor talks",
            "Share your project with sponsors even if you don't win",
            "Attend sponsor-hosted side events and workshops"
          ]
        },
        {
          secret: "The Alumni Network",
          description: "Previous hackathon participants often become mentors, investors, or hiring managers",
          tactics: [
            "Stay connected with teammates from different hackathons",
            "Join hackathon alumni groups and Discord servers",
            "Attend hackathon reunion events and meetups",
            "Share opportunities and resources with the community"
          ]
        },
        {
          secret: "The Learning Multiplier",
          description: "Each hackathon should build on previous experiences",
          tactics: [
            "Maintain a hackathon portfolio with learnings",
            "Track your skill development over time",
            "Experiment with new technologies at each event",
            "Document your problem-solving approaches"
          ]
        }
      ]
    },
    {
      title: "The Psychology of Hackathon Success",
      icon: HeartIcon,
      insights: [
        {
          secret: "Energy Management",
          description: "Winners manage their energy, not just their time",
          tactics: [
            "Plan for energy dips at hour 20 and 35",
            "Use power naps strategically (20 minutes max)",
            "Maintain proper nutrition and hydration",
            "Take breaks for physical movement and mental reset"
          ]
        },
        {
          secret: "Flow State Optimization",
          description: "Creating conditions for deep work and creativity",
          tactics: [
            "Use noise-canceling headphones with focus music",
            "Batch similar tasks together",
            "Minimize context switching between different technologies",
            "Create a dedicated workspace even in shared venues"
          ]
        },
        {
          secret: "Team Dynamics",
          description: "High-performing teams have specific behavioral patterns",
          tactics: [
            "Establish clear communication protocols",
            "Rotate leadership based on project phases",
            "Celebrate small wins throughout the event",
            "Practice constructive conflict resolution"
          ]
        }
      ]
    }
  ];

  const emergingTrends = [
    {
      category: "Next-Gen Technologies",
      icon: RocketLaunchIcon,
      trends: [
        {
          name: "AI-First Development",
          description: "Building applications where AI is the core, not an add-on",
          opportunities: [
            "Multimodal AI applications (text, image, audio, video)",
            "AI agents that can perform complex tasks",
            "Personalized AI assistants for specific domains",
            "AI-powered code generation and debugging tools"
          ],
          resources: [
            "LangChain for AI application development",
            "Pinecone for vector databases",
            "Streamlit for rapid AI prototyping",
            "Replicate for model deployment"
          ]
        },
        {
          name: "Sustainable Technology",
          description: "Tech solutions addressing climate change and sustainability",
          opportunities: [
            "Carbon footprint tracking and reduction apps",
            "Sustainable supply chain transparency tools",
            "Green energy optimization platforms",
            "Circular economy marketplaces"
          ],
          resources: [
            "Climate change APIs for environmental data",
            "Sustainability frameworks and standards",
            "Green tech startup case studies",
            "Environmental impact measurement tools"
          ]
        },
        {
          name: "Decentralized Applications",
          description: "Web3 and blockchain-based solutions",
          opportunities: [
            "Decentralized identity and credential systems",
            "Community-governed platforms and DAOs",
            "NFT-based loyalty and rewards programs",
            "Blockchain-powered supply chain tracking"
          ],
          resources: [
            "Ethereum development frameworks",
            "IPFS for decentralized storage",
            "Web3 authentication libraries",
            "Smart contract security best practices"
          ]
        }
      ]
    },
    {
      category: "Social Impact Focus",
      icon: GlobeAltIcon,
      trends: [
        {
          name: "Digital Accessibility",
          description: "Making technology accessible to everyone",
          opportunities: [
            "AI-powered accessibility tools",
            "Voice-controlled interfaces for disabilities",
            "Sign language recognition and translation",
            "Cognitive accessibility support systems"
          ],
          impact: "Over 1 billion people worldwide have disabilities"
        },
        {
          name: "Education Technology",
          description: "Revolutionizing how people learn and teach",
          opportunities: [
            "Personalized learning pathways",
            "VR/AR educational experiences",
            "Skill-based learning marketplaces",
            "AI tutoring and assessment systems"
          ],
          impact: "Global EdTech market expected to reach $377 billion by 2028"
        },
        {
          name: "Healthcare Innovation",
          description: "Improving health outcomes through technology",
          opportunities: [
            "Mental health support applications",
            "Telemedicine and remote monitoring",
            "Health data analytics and insights",
            "Medication adherence and management"
          ],
          impact: "Digital health market growing at 25% annually"
        }
      ]
    }
  ];

  const tabs = [
    { id: 'mindset', label: 'Mindset & Strategy', icon: FireIcon },
    { id: 'advanced', label: 'Advanced Tactics', icon: BoltIcon },
    { id: 'pitching', label: 'Pitching Mastery', icon: MicrophoneIcon },
    { id: 'community', label: 'Community Secrets', icon: UserGroupIcon },
    { id: 'trends', label: 'Emerging Trends', icon: StarIcon },
    { id: 'tools', label: 'Tools & Resources', icon: WrenchScrewdriverIcon },
  ];

  const renderContentItem = (item: string, idx: number, totalItems: number, type: 'phase' | 'structure') => (
    <div key={idx} className="relative pl-10 pb-8">
      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
        <span className="text-white font-bold">{idx + 1}</span>
      </div>
      <div className="bg-slate-700/30 rounded-lg p-4">
        <p className="text-gray-300">{item}</p>
      </div>
      {idx < totalItems - 1 && (
        <div className={`absolute ${type === 'phase' ? 'left-8 top-16' : 'left-10 top-20'} w-0.5 h-12 bg-gradient-to-b from-purple-600 to-pink-600`}></div>
      )}
    </div>
  );

  const renderSectionContent = (section: Section) => {
    const content = section.content ?? DEFAULT_SECTION_CONTENT;

    if (!content.items.length) {
      return null;
    }

    return (
      <div className="relative">
        {content.items.map((item, idx) => 
          renderContentItem(item, idx, content.items.length, content.type)
        )}
      </div>
    );
  };

  const renderStrategyContent = (strategy: Strategy) => {
    return (
      <>
        {strategy.framework && (
          <div className="bg-slate-700/30 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-purple-300 mb-3">Framework</h4>
            <div className="flex items-center space-x-4 text-gray-300">
              {strategy.framework.split(' → ').map((step: string, stepIdx: number) => (
                <React.Fragment key={stepIdx}>
                  <div className="bg-purple-600/20 px-3 py-1 rounded-lg text-center">
                    {step}
                  </div>
                  {stepIdx < strategy.framework!.split(' → ').length - 1 && (
                    <ArrowRightIcon className="w-4 h-4 text-purple-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {strategy.examples && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-purple-300 mb-3">Examples</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {strategy.examples.map((example: string, exIdx: number) => (
                <div key={exIdx} className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/10">
                  <p className="text-gray-300 text-sm">{example}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {strategy.validation && (
          <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/20">
            <h4 className="text-lg font-semibold text-green-300 mb-3">Validation Steps</h4>
            <ul className="space-y-2">
              {strategy.validation.map((step: string, valIdx: number) => (
                <li key={valIdx} className="flex items-start">
                  <ShieldCheckIcon className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {strategy.stack && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-purple-300 mb-3">Recommended Stack</h4>
              <div className="space-y-3">
                {Object.entries(strategy.stack).map(([category, tools]) => (
                  <div key={category}>
                    <span className="text-sm text-gray-400 uppercase tracking-wide">{category}</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(tools as string[]).map((tool: string, toolIdx: number) => (
                        <span key={toolIdx} className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-md text-sm">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-purple-300 mb-3">Best Practices</h4>
              <ul className="space-y-2">
                {(strategy.deployment || strategy.debugging || strategy.bestPractices || []).map((practice: string, practiceIdx: number) => (
                  <li key={practiceIdx} className="flex items-start">
                    <BoltIcon className="w-4 h-4 text-yellow-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {strategy.approaches && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-purple-300">AI Integration Approaches</h4>
            {strategy.approaches.map((approach: AIApproach, appIdx: number) => (
              <div key={appIdx} className="bg-slate-700/30 rounded-lg p-4">
                <h5 className="font-semibold text-white mb-2">{approach.type}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-400">Tools:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {approach.tools.map((tool: string, toolIdx: number) => (
                        <span key={toolIdx} className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Use Cases:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {approach.useCases.map((useCase: string, ucIdx: number) => (
                        <span key={ucIdx} className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs">
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderTrends = (category: Category) => {
    const trendSection: TrendSection = {
      title: category.category,
      trends: category.trends
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trendSection.trends.map((trend: Trend, idx: number) => (
          <div key={idx} className="bg-slate-700/30 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-purple-300 mb-3">{trend.name}</h4>
            <p className="text-gray-300 mb-4">{trend.description}</p>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-purple-200 mb-2">Opportunities</h5>
                <ul className="space-y-2">
                  {trend.opportunities.map((opportunity: string, oppIdx: number) => (
                    <li key={oppIdx} className="flex items-start space-x-2">
                      <SparklesIcon className="w-5 h-5 text-purple-400 mt-0.5" />
                      <span className="text-gray-300">{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {trend.impact && (
                <div>
                  <h5 className="text-sm font-medium text-purple-200 mb-2">Impact</h5>
                  <p className="text-gray-300">{trend.impact}</p>
                </div>
              )}

              {trend.resources && (
                <div>
                  <h5 className="text-sm font-medium text-purple-200 mb-2">Resources</h5>
                  <ul className="space-y-2">
                    {trend.resources.map((resource: string, resIdx: number) => (
                      <li key={resIdx} className="flex items-start space-x-2">
                        <LinkIcon className="w-5 h-5 text-purple-400 mt-0.5" />
                        <span className="text-gray-300">{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Animated Hero Section */}
      <div className="relative overflow-hidden rounded-tl-[50px] rounded-tr-[50px] rounded-bl-[50px] rounded-br-[50px] bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 pb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse"></div>
        
        {/* Curved Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <TrophyIcon className="w-16 h-16 text-yellow-400 mr-4 animate-bounce" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                Hackathon Mastery
              </h1>
            </div>
            <div className="h-20 flex items-center justify-center">
              <p className="text-2xl text-gray-300 font-light">
                {typedText}
                <span className="animate-pulse">|</span>
              </p>
            </div>
            <div className="flex justify-center space-x-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400">10K+</div>
                <div className="text-gray-400">Winners Created</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">$2M+</div>
                <div className="text-gray-400">Prize Money Won</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">500+</div>
                <div className="text-gray-400">Hackathons Covered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-2">
          <nav className="flex justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 mx-1 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'mindset' && (
          <div className="space-y-12">
            {hackathonMindset.map((section, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
                <div className="p-8 border-b border-purple-500/20">
                  <div className="flex items-center">
                    <section.icon className="w-12 h-12 text-purple-400 mr-6" />
                    <div>
                      <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                      <p className="text-gray-400 text-lg">{section.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  {section.content.principles && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                      {section.content.principles.map((principle, idx) => (
                        <div key={idx} className="bg-slate-700/30 rounded-xl p-6 border border-purple-500/10">
                          <h3 className="text-xl font-semibold text-purple-300 mb-3">{principle.title}</h3>
                          <p className="text-gray-300 mb-4">{principle.description}</p>
                          <div className="bg-slate-900/50 rounded-lg p-3">
                            <span className="text-sm text-yellow-400 font-medium">Pro Tip: </span>
                            <span className="text-sm text-gray-300">{principle.tip}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {section.content.psychology && (
                    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20">
                      <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <ChartBarIcon className="w-6 h-6 mr-2" />
                        {section.content.psychology.title}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.content.psychology.insights.map((insight, idx) => (
                          <div key={idx} className="flex items-start">
                            <StarIcon className="w-5 h-5 text-yellow-400 mr-2 mt-1 flex-shrink-0" />
                            <span className="text-gray-300">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {section.content.phases && (
                    <div className="space-y-8">
                      {section.content.phases.map((phase, idx) => (
                        <div key={idx} className="relative">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {idx + 1}
                            </div>
                            <div className="ml-6 flex-1">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-white">{phase.phase}</h3>
                                <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                                  {phase.duration}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                  <h4 className="text-lg font-medium text-purple-300 mb-3">Key Activities</h4>
                                  <ul className="space-y-2">
                                    {phase.activities.map((activity, actIdx) => (
                                      <li key={actIdx} className="flex items-start">
                                        <ArrowRightIcon className="w-4 h-4 text-purple-400 mr-2 mt-1 flex-shrink-0" />
                                        <span className="text-gray-300">{activity}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/20">
                                  <h4 className="text-lg font-medium text-yellow-300 mb-2 flex items-center">
                                    <LightBulbIcon className="w-5 h-5 mr-2" />
                                    Pro Tip
                                  </h4>
                                  <p className="text-gray-300 text-sm">{phase.proTip}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          {idx < (section.content.phases ?? []).length - 1 && (
                            <div className="absolute left-8 top-16 w-0.5 h-12 bg-gradient-to-b from-purple-600 to-pink-600"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-12">
            {advancedStrategies.map((category, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
                <div className="p-8 border-b border-purple-500/20">
                  <div className="flex items-center">
                    <category.icon className="w-12 h-12 text-purple-400 mr-6" />
                    <h2 className="text-3xl font-bold text-white">{category.category}</h2>
                  </div>
                </div>
                <div className="p-8">
                  <div className="space-y-12">
                    {category.strategies.map((strategy, idx) => (
                      <div key={idx} className="border-l-4 border-purple-500 pl-8">
                        <h3 className="text-2xl font-bold text-white mb-4">{strategy.name}</h3>
                        <p className="text-gray-300 text-lg mb-6">{strategy.description}</p>
                        
                        {renderStrategyContent(strategy)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'pitching' && (
          <div className="space-y-12">
            {pitchingMastery.map((section, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
                <div className="p-8 border-b border-purple-500/20">
                  <div className="flex items-center">
                    <section.icon className="w-12 h-12 text-purple-400 mr-6" />
                    <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                  </div>
                </div>
                <div className="p-8">
                  {section.content.structure && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-6 py-2">
                          <ClockIcon className="w-5 h-5 mr-2" />
                          <span className="text-white font-semibold">Total Time: 2 Minutes</span>
                        </div>
                      </div>
                      {section.content.structure.map((part, idx) => (
                        <div key={idx} className="relative">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                              {part.section.split(' ')[0]}
                            </div>
                            <div className="ml-6 flex-1">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-white">{part.section}</h3>
                                <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                                  {part.section.match(/\(([^)]+)\)/)?.[1]}
                                </span>
                              </div>
                              <p className="text-gray-400 mb-6">{part.purpose}</p>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-lg font-medium text-purple-300 mb-3">Techniques</h4>
                                  <ul className="space-y-2">
                                    {part.techniques.map((technique, techIdx) => (
                                      <li key={techIdx} className="flex items-start">
                                        <ArrowRightIcon className="w-4 h-4 text-purple-400 mr-2 mt-1 flex-shrink-0" />
                                        <span className="text-gray-300">{technique}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-lg font-medium text-green-300 mb-3">Examples</h4>
                                  <div className="space-y-3">
                                    {part.examples.map((example, exIdx) => (
                                      <div key={exIdx} className="bg-slate-900/50 rounded-lg p-3 border border-green-500/20">
                                        <p className="text-gray-300 text-sm italic">"{example}"</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {idx < (section.content.structure ?? []).length - 1 && (
                            <div className="absolute left-10 top-20 w-0.5 h-12 bg-gradient-to-b from-purple-600 to-pink-600"></div>
                          )}
                        </div>
                      ))}
                      
                      <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-500/20 mt-8">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                          <SparklesIcon className="w-6 h-6 mr-2" />
                          Advanced Techniques
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {section.content.advanced_techniques.map((technique, techIdx) => (
                            <div key={techIdx} className="bg-slate-800/50 rounded-lg p-4">
                              <h4 className="font-semibold text-yellow-300 mb-2">{technique.name}</h4>
                              <p className="text-gray-300 text-sm mb-3">{technique.description}</p>
                              {technique.elements && (
                                <div className="space-y-1">
                                  {technique.elements.map((element, elIdx) => (
                                    <div key={elIdx} className="text-xs text-gray-400 flex items-center">
                                      <div className="w-1 h-1 bg-yellow-400 rounded-full mr-2"></div>
                                      {element}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {technique.structure && (
                                <div className="text-xs text-gray-300 bg-slate-900/50 rounded p-2 mt-2">
                                  {technique.structure}
                                </div>
                              )}
                              {technique.criteria && (
                                <div className="space-y-1 mt-2">
                                  {technique.criteria.map((criterion, critIdx) => (
                                    <div key={critIdx} className="text-xs text-gray-400 flex items-center">
                                      <EyeIcon className="w-3 h-3 mr-1" />
                                      {criterion}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {section.content.design_principles && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {section.content.design_principles.map((principle, idx) => (
                          <div key={idx} className="bg-slate-700/30 rounded-xl p-6">
                            <h3 className="text-xl font-semibold text-purple-300 mb-4">{principle.principle}</h3>
                            <p className="text-gray-300 mb-4">{principle.description}</p>
                            <ul className="space-y-2">
                              {principle.techniques.map((technique, techIdx) => (
                                <li key={techIdx} className="flex items-start">
                                  <PaintBrushIcon className="w-4 h-4 text-pink-400 mr-2 mt-1 flex-shrink-0" />
                                  <span className="text-gray-300 text-sm">{technique}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/20">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                          <DocumentTextIcon className="w-6 h-6 mr-2" />
                          Winning Slide Templates
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {section.content.slide_templates.map((template, idx) => (
                            <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-blue-500/20">
                              <h4 className="font-semibold text-blue-300 mb-3">{template.type}</h4>
                              <ul className="space-y-1">
                                {template.elements.map((element, elIdx) => (
                                  <li key={elIdx} className="text-xs text-gray-400 flex items-center">
                                    <div className="w-1 h-1 bg-blue-400 rounded-full mr-2"></div>
                                    {element}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-12">
            {communitySecrets.map((section, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
                <div className="p-8 border-b border-purple-500/20">
                  <div className="flex items-center">
                    <section.icon className="w-12 h-12 text-purple-400 mr-6" />
                    <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                  </div>
                </div>
                <div className="p-8">
                  <div className="space-y-8">
                    {section.insights.map((insight, idx) => (
                      <div key={idx} className="border-l-4 border-yellow-500 pl-8">
                        <h3 className="text-2xl font-bold text-white mb-2">{insight.secret}</h3>
                        <p className="text-gray-300 text-lg mb-6">{insight.description}</p>
                        <div className="bg-slate-700/30 rounded-xl p-6">
                          <h4 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center">
                            <HandRaisedIcon className="w-5 h-5 mr-2" />
                            Action Steps
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {insight.tactics.map((tactic, tacticIdx) => (
                              <div key={tacticIdx} className="flex items-start">
                                <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm mr-3 mt-1">
                                  {tacticIdx + 1}
                                </div>
                                <span className="text-gray-300">{tactic}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-12">
            {emergingTrends.map((category, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
                <div className="p-8 border-b border-purple-500/20">
                  <div className="flex items-center">
                    <category.icon className="w-12 h-12 text-purple-400 mr-6" />
                    <h2 className="text-3xl font-bold text-white">{category.category}</h2>
                  </div>
                </div>
                <div className="p-8">
                  {renderTrends(category)}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8">
            <div className="text-center">
              <WrenchScrewdriverIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">Ultimate Hackathon Toolkit</h2>
              <p className="text-gray-400 text-lg mb-8">Coming Soon - A comprehensive collection of tools, templates, and resources</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-700/30 rounded-xl p-6 border border-purple-500/10">
                  <CodeBracketIcon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Code Templates</h3>
                  <p className="text-gray-400 text-sm">Starter kits for popular tech stacks</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-6 border border-purple-500/10">
                  <PresentationChartLineIcon className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Pitch Templates</h3>
                  <p className="text-gray-400 text-sm">Winning presentation formats</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-6 border border-purple-500/10">
                  <BeakerIcon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">API Directory</h3>
                  <p className="text-gray-400 text-sm">Curated list of hackathon-friendly APIs</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;