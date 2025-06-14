export interface Hackathon {
  id?: string;
  title: string;
  description: string; // Overview/long description
  overview: string;
  eligibility: string;
  techStack: string[];
  timeline: string;
  teamSize: string;
  prize: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  location: string;
  platform: string;
  domain: string;
  registrationLink: string;
  status: 'upcoming' | 'ongoing' | 'past';
  thumbnailUrl: string;
} 