import { IconType } from 'react-icons';

export interface Skill {
  name: string;
  icon: string;
  color: string;
}

export interface SkillCategory {
  title: string;
  skills: Skill[];
}

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
}

export interface Experience {
  date: string;
  title: string;
  company: string;
  description: string;
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  date: string;
  credentialUrl: string;
  image: string;
}
