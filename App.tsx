
import React, { useState, useEffect, createContext, useContext, useMemo, FC, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as ScrollLink, Events, scrollSpy } from 'react-scroll';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaReact, FaNodeJs, FaVuejs, FaAws, FaDocker, FaFigma, FaGitAlt } from 'react-icons/fa';
import { SiTypescript, SiJavascript, SiHtml5, SiCss3, SiTailwindcss, SiNextdotjs, SiExpress, SiMongodb, SiPostgresql, SiRedis, SiVite, SiWebpack, SiJest } from 'react-icons/si';
import { FiSun, FiMoon, FiMenu, FiX, FiDownload, FiSend, FiArrowUp, FiSettings, FiSave, FiTrash2, FiPlusCircle, FiLogOut } from 'react-icons/fi';

import type { Project, SkillCategory, Experience, Skill } from './types';

// This is required for TypeScript to recognize the 'google' object from the GSI script
declare const google: any;

// A simple JWT decoder for getting user info from Google's credential
interface GoogleJwtPayload {
    email: string;
    name: string;
    picture: string;
}
function jwt_decode<T>(token: string): T {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload) as T;
}

// THEME CONTEXT
const ThemeContext = createContext<{ theme: string; toggleTheme: () => void; } | null>(null);

const ThemeProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// ICON MAPPING FOR DYNAMIC CONTENT
const iconMap: { [key: string]: React.ElementType } = {
    FaReact, FaNodeJs, FaVuejs, FaAws, FaDocker, FaFigma, FaGitAlt, SiTypescript, SiJavascript,
    SiHtml5, SiCss3, SiTailwindcss, SiNextdotjs, SiExpress, SiMongodb, SiPostgresql,
    SiRedis, SiVite, SiWebpack, SiJest,
};

// MOCK DATA (DEFAULT)
const defaultPortfolioData = {
    name: "Sameer Bavaji",
    tagline: "I build elegant and performant web applications.",
    resumeUrl: "/resume.pdf",
    socials: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
        email: "mailto:sameer.bavaji@example.com"
    },
    about: "I'm a passionate Full-Stack Developer with a knack for creating beautiful, functional, and user-centric digital experiences. With a strong foundation in modern web technologies, I enjoy tackling complex problems and turning ideas into reality. When I'm not coding, I enjoy exploring new technologies, contributing to open-source, and brewing the perfect cup of coffee.",
    experiences: [
        { date: "2021 - Present", title: "Senior Web Developer", company: "Tech Solutions Inc.", description: "Led development of scalable web apps using React and Node.js. Mentored junior developers and improved code quality by 30%." },
        { date: "2019 - 2021", title: "Frontend Developer", company: "Creative Minds LLC", description: "Developed and maintained responsive user interfaces for various clients, enhancing user engagement metrics by 25%." },
        { date: "2018 - 2019", title: "Junior Developer", company: "Innovate Co.", description: "Assisted in building and testing web applications, gaining hands-on experience with the MERN stack." },
        { date: "2018", title: "B.Sc. in Computer Science", company: "University of Technology", description: "Graduated with honors, focusing on software engineering and web development principles." }
    ] as Experience[],
    skills: [
        { title: "Frontend", skills: [ { name: "React", icon: "FaReact", color: "#61DAFB" }, { name: "Next.js", icon: "SiNextdotjs", color: "#000000" }, { name: "Vue.js", icon: "FaVuejs", color: "#4FC08D" }, { name: "TypeScript", icon: "SiTypescript", color: "#3178C6" }, { name: "JavaScript", icon: "SiJavascript", color: "#F7DF1E" }, { name: "HTML5", icon: "SiHtml5", color: "#E34F26" }, { name: "CSS3", icon: "SiCss3", color: "#1572B6" }, { name: "Tailwind CSS", icon: "SiTailwindcss", color: "#06B6D4" } ] },
        { title: "Backend", skills: [ { name: "Node.js", icon: "FaNodeJs", color: "#339933" }, { name: "Express", icon: "SiExpress", color: "#000000" }, { name: "PostgreSQL", icon: "SiPostgresql", color: "#4169E1" }, { name: "MongoDB", icon: "SiMongodb", color: "#47A248" }, { name: "Redis", icon: "SiRedis", color: "#DC382D" } ] },
        { title: "Cloud & DevOps", skills: [ { name: "AWS", icon: "FaAws", color: "#FF9900" }, { name: "Docker", icon: "FaDocker", color: "#2496ED" }, { name: "Git", icon: "FaGitAlt", color: "#F05032" } ] },
        { title: "Tools", skills: [ { name: "Vite", icon: "SiVite", color: "#646CFF" }, { name: "Webpack", icon: "SiWebpack", color: "#8DD6F9" }, { name: "Jest", icon: "SiJest", color: "#C21325" }, { name: "Figma", icon: "FaFigma", color: "#F24E1E" } ] }
    ] as SkillCategory[],
    projects: [
        { id: 1, title: "E-Commerce Platform", description: "A feature-rich e-commerce site with product management, user authentication, and a Stripe payment gateway.", image: "https://picsum.photos/seed/project1/600/400", tags: ["React", "Node.js", "MongoDB", "Stripe"], liveUrl: "#", githubUrl: "#" },
        { id: 2, title: "Real-Time Chat App", description: "A WebSocket-based chat application for instant messaging, with support for rooms and private messages.", image: "https://picsum.photos/seed/project2/600/400", tags: ["Vue.js", "Express", "Socket.io"], liveUrl: "#", githubUrl: "#" },
        { id: 3, title: "Project Management Tool", description: "A Kanban-style project management tool with drag-and-drop functionality and collaborative features.", image: "https://picsum.photos/seed/project3/600/400", tags: ["React", "Next.js", "PostgreSQL"], liveUrl: "#", githubUrl: "#" },
        { id: 4, title: "Personal Blog", description: "A statically generated blog using Next.js and Markdown, optimized for performance and SEO.", image: "https://picsum.photos/seed/project4/600/400", tags: ["Next.js", "TypeScript", "Tailwind CSS"], liveUrl: "#", githubUrl: "#" },
        { id: 5, title: "Weather Dashboard", description: "A clean and modern weather dashboard that provides real-time weather data using a third-party API.", image: "https://picsum.photos/seed/project5/600/400", tags: ["React", "API"], liveUrl: "#", githubUrl: "#" },
        { id: 6, title: "Data Visualization App", description: "An application that visualizes complex datasets using D3.js, with interactive charts and graphs.", image: "https://picsum.photos/seed/project6/600/400", tags: ["React", "D3.js", "TypeScript"], liveUrl: "#", githubUrl: "#" }
    ] as Project[]
};
type PortfolioData = typeof defaultPortfolioData;
type AdminUser = { name: string; email: string; picture: string };

// UI COMPONENTS
const Section: FC<{ id: string; className?: string; children: React.ReactNode }> = ({ id, className = '', children }) => (
    <motion.section
        id={id}
        className={`py-20 md:py-28 ${className}`}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
    >
        <div className="container mx-auto px-4">{children}</div>
    </motion.section>
);

const SectionTitle: FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">
        {children}
    </h2>
);

const NeonButton: FC<{ children: React.ReactNode; onClick?: () => void; href?: string; download?: boolean | string, className?: string; as?: 'button' | 'a'; type?: 'button' | 'submit' }> = ({ children, onClick, href, download = false, className = '', as = 'button', type = 'button' }) => {
  const commonClasses = `
    relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-indigo-600 
    transition duration-300 ease-out border-2 border-indigo-500 rounded-full shadow-md group ${className}
  `;
  const spanClasses = `
    absolute inset-0 w-full h-full bg-white dark:bg-gray-800
    transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 
    group-hover:bg-indigo-500 dark:group-hover:bg-indigo-600 group-hover:skew-x-0
  `;
  const textClasses = `relative group-hover:text-white dark:text-gray-200`;

  if (as === 'a') {
    return (
        <a href={href} download={download} className={commonClasses} target="_blank" rel="noopener noreferrer">
            <span className={spanClasses}></span>
            <span className={textClasses}>{children}</span>
        </a>
    );
  }

  return (
    <button onClick={onClick} className={commonClasses} type={type}>
      <span className={spanClasses}></span>
      <span className={textClasses}>{children}</span>
    </button>
  );
};


// SECTIONS
const Navbar: FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        Events.scrollEvent.register('begin', () => setIsOpen(false));
        scrollSpy.update();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            Events.scrollEvent.remove('begin');
        };
    }, []);

    const navLinks = ["home", "about", "projects", "skills", "contact"];
    const linkClasses = "capitalize cursor-pointer py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-300";
    const activeLinkClasses = "text-indigo-500 dark:text-indigo-400";
    
    return (
        <nav className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${scrolled ? 'py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md' : 'py-6'}`}>
            <div className="container mx-auto px-4 flex justify-between items-center">
                <ScrollLink to="home" smooth={true} duration={500} className="text-2xl font-bold cursor-pointer text-gray-800 dark:text-white">
                    S<span className="text-indigo-500">B</span>
                </ScrollLink>
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map(link => (
                        <ScrollLink key={link} to={link} spy={true} smooth={true} offset={-70} duration={500} className={linkClasses} activeClass={activeLinkClasses}>
                            {link}
                        </ScrollLink>
                    ))}
                    <button onClick={toggleTheme} aria-label="Toggle Theme" className="text-xl text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400">
                        {theme === 'light' ? <FiMoon /> : <FiSun />}
                    </button>
                </div>
                <div className="md:hidden flex items-center space-x-4">
                     <button onClick={toggleTheme} aria-label="Toggle Theme" className="text-xl text-gray-600 dark:text-gray-300">
                        {theme === 'light' ? <FiMoon /> : <FiSun />}
                    </button>
                    <button onClick={() => setIsOpen(!isOpen)} className="text-2xl z-50 text-gray-800 dark:text-white" aria-label="Menu">
                        {isOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: "-100%" }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: "-100%" }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="md:hidden absolute top-0 left-0 w-full h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center space-y-8"
                        >
                            {navLinks.map(link => (
                                <ScrollLink key={link} to={link} spy={true} smooth={true} offset={-70} duration={500} onClick={() => setIsOpen(false)} className={`${linkClasses} text-2xl`} activeClass={activeLinkClasses}>
                                    {link}
                                </ScrollLink>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

const Hero: FC<{data: PortfolioData}> = ({data}) => {
    const title = "Full-Stack Developer";
    const titleVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
            },
        },
    };
    const letterVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-purple-50/20 dark:from-indigo-900/10 dark:to-purple-900/10 backdrop-blur-sm"></div>
            <div className="container mx-auto px-4 z-10">
                <div className="grid md:grid-cols-2 items-center gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center md:text-left"
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 dark:text-white mb-4">
                            Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">{data.name}</span>
                        </h1>
                        <motion.h2
                            variants={titleVariants}
                            initial="hidden"
                            animate="visible"
                            className="h-16 text-2xl md:text-3xl font-semibold text-gray-600 dark:text-gray-300 mb-6"
                        >
                            {title.split("").map((char, index) => (
                                <motion.span key={index} variants={letterVariants} className="inline-block">
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            ))}
                        </motion.h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto md:mx-0">
                            {data.tagline}
                        </p>
                        <div className="flex justify-center md:justify-start space-x-4 mb-8">
                             <NeonButton as="a" href="#contact">Hire Me</NeonButton>
                             <NeonButton as="a" href={data.resumeUrl} download="Sameer-Bavaji-Resume.pdf">
                                 <FiDownload className="mr-2"/> Download CV
                             </NeonButton>
                        </div>
                         <div className="flex justify-center md:justify-start space-x-6">
                            <a href={data.socials.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="text-2xl text-gray-500 hover:text-indigo-500 transition-colors"><FaGithub /></a>
                            <a href={data.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-2xl text-gray-500 hover:text-indigo-500 transition-colors"><FaLinkedin /></a>
                            <a href={data.socials.twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="text-2xl text-gray-500 hover:text-indigo-500 transition-colors"><FaTwitter /></a>
                            <a href={data.socials.email} aria-label="Email" className="text-2xl text-gray-500 hover:text-indigo-500 transition-colors"><FaEnvelope /></a>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex justify-center"
                    >
                        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 blur-2xl animate-pulse"></div>
                            <img src="https://picsum.photos/seed/profile/400/400" alt={data.name} className="relative w-full h-full object-cover rounded-full shadow-2xl border-4 border-white dark:border-gray-800" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

const About: FC<{data: PortfolioData}> = ({data}) => (
    <Section id="about" className="bg-white dark:bg-gray-800">
        <SectionTitle>About Me</SectionTitle>
        <div className="grid md:grid-cols-5 gap-12 items-center">
            <motion.div
                className="md:col-span-2 flex justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
            >
                <img src="https://picsum.photos/seed/about/400/500" alt="About Sameer" className="rounded-lg shadow-xl w-full max-w-sm"/>
            </motion.div>
            <div className="md:col-span-3">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{data.about}</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Experience & Education</h3>
                <div className="relative border-l-2 border-indigo-200 dark:border-indigo-800">
                    {data.experiences.map((exp, index) => (
                        <motion.div
                            key={index}
                            className="mb-10 ml-6"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-200 rounded-full -left-3 ring-8 ring-white dark:ring-gray-800 dark:bg-indigo-900">
                                <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002 2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
                            </span>
                            <h4 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">{exp.title} <span className="bg-indigo-100 text-indigo-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300 ml-3">{exp.date}</span></h4>
                            <p className="block mb-2 text-sm font-normal leading-none text-gray-500 dark:text-gray-400">{exp.company}</p>
                            <p className="mb-4 text-base font-normal text-gray-600 dark:text-gray-300">{exp.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    </Section>
);

const Projects: FC<{projects: Project[]}> = ({projects}) => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const allTags = useMemo(() => ['All', ...new Set(projects.flatMap(p => p.tags))], [projects]);

    const filteredProjects = useMemo(() => {
        return projects
            .filter(p => activeFilter === 'All' || p.tags.includes(activeFilter))
            .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [activeFilter, searchQuery, projects]);

    return (
        <Section id="projects">
            <SectionTitle>Featured Projects</SectionTitle>
            <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
                 <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full sm:w-auto"
                />
                {allTags.map(tag => (
                    <button 
                        key={tag} 
                        onClick={() => setActiveFilter(tag)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${activeFilter === tag ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                {filteredProjects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group h-full flex flex-col">
                            <div className="overflow-hidden">
                                <img src={project.image} alt={project.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"/>
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{project.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">{project.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.tags.map(tag => (
                                        <span key={tag} className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-300">{tag}</span>
                                    ))}
                                </div>
                                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Live Demo</a>
                                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors text-2xl"><FaGithub /></a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
        </Section>
    );
};

const Skills: FC<{skills: SkillCategory[]}> = ({skills}) => (
    <Section id="skills" className="bg-white dark:bg-gray-800">
        <SectionTitle>My Skills</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skills.map((category, index) => (
                <motion.div 
                    key={category.title} 
                    className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <h3 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">{category.title}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {category.skills.map(skill => {
                            const Icon = iconMap[skill.icon];
                            return (
                                <div key={skill.name} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    {Icon && <Icon style={{ color: skill.color }} className="text-2xl"/>}
                                    <span className="text-gray-700 dark:text-gray-200">{skill.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            ))}
        </div>
    </Section>
);

const Contact: FC = () => {
    const [status, setStatus] = useState('');
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('Thank you for your message!');
        setTimeout(() => setStatus(''), 3000);
        (e.target as HTMLFormElement).reset();
    };

    return (
        <Section id="contact">
            <SectionTitle>Get In Touch</SectionTitle>
            <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <input type="text" name="name" placeholder="Your Name" required className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
                        <input type="email" name="email" placeholder="Your Email" required className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
                    </div>
                    <textarea name="message" placeholder="Your Message" rows={5} required className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"></textarea>
                    <div className="text-center">
                        <NeonButton as="button" type="submit" className="w-full md:w-auto">
                            Send Message <FiSend className="ml-2"/>
                        </NeonButton>
                    </div>
                    {status && <p className="text-center mt-4 text-green-500">{status}</p>}
                </form>
            </div>
        </Section>
    );
};

const Footer: FC<{data: PortfolioData}> = ({data}) => (
    <footer className="bg-white dark:bg-gray-800 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
            <div className="flex justify-center space-x-6 mb-4">
                <a href={data.socials.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="text-xl hover:text-indigo-500 transition-colors"><FaGithub /></a>
                <a href={data.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-xl hover:text-indigo-500 transition-colors"><FaLinkedin /></a>
                <a href={data.socials.twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="text-xl hover:text-indigo-500 transition-colors"><FaTwitter /></a>
                <a href={data.socials.email} aria-label="Email" className="text-xl hover:text-indigo-500 transition-colors"><FaEnvelope /></a>
            </div>
            <p>&copy; {new Date().getFullYear()} {data.name}. All Rights Reserved.</p>
        </div>
    </footer>
);

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => setIsVisible(window.pageYOffset > 300);
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-indigo-500 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl z-50 hover:bg-indigo-600 transition-colors"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    aria-label="Scroll to top"
                >
                    <FiArrowUp />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

const AdminPanel: FC<{ data: PortfolioData; onSave: (newData: PortfolioData) => void; onLogout: () => void; adminUser: AdminUser; adminEmail: string; onAdminEmailChange: (newEmail: string) => void; }> = ({ data, onSave, onLogout, adminUser, adminEmail, onAdminEmailChange }) => {
    const [editableData, setEditableData] = useState<PortfolioData>(data);
    const [activeTab, setActiveTab] = useState('general');
    const [newAdminEmail, setNewAdminEmail] = useState(adminEmail);
    const [emailChangeMessage, setEmailChangeMessage] = useState({ type: '', text: '' });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditableData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditableData(prev => ({ ...prev, socials: { ...prev.socials, [name]: value } }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: string, project_id?: number) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (field === 'resumeUrl') {
                    setEditableData(prev => ({ ...prev, resumeUrl: event.target?.result as string }));
                } else if (field === 'projectImage' && project_id !== undefined) {
                    setEditableData(prev => ({
                        ...prev,
                        projects: prev.projects.map(p => p.id === project_id ? { ...p, image: event.target?.result as string } : p)
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleProjectChange = (id: number, field: string, value: string) => {
         setEditableData(prev => ({ ...prev, projects: prev.projects.map(p => p.id === id ? {...p, [field]: field === 'tags' ? value.split(',').map(t => t.trim()) : value} : p) }));
    };
    
    const addProject = () => {
        const newProject: Project = { id: Date.now(), title: "New Project", description: "", image: "https://picsum.photos/seed/new/600/400", tags: [], liveUrl: "#", githubUrl: "#" };
        setEditableData(prev => ({...prev, projects: [newProject, ...prev.projects]}));
    };

    const deleteProject = (id: number) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            setEditableData(prev => ({...prev, projects: prev.projects.filter(p => p.id !== id)}));
        }
    };

    const handleSkillChange = (catIndex: number, skillIndex: number, field: 'name' | 'icon' | 'color', value: string) => {
        setEditableData(prev => {
            const newSkillsData = prev.skills.map((category, cIndex) => {
                if (cIndex !== catIndex) return category;
                return {
                    ...category,
                    skills: category.skills.map((skill, sIndex) => {
                        if (sIndex !== skillIndex) return skill;
                        return { ...skill, [field]: value };
                    })
                };
            });
            return { ...prev, skills: newSkillsData };
        });
    };
    
    const tabs = ['general', 'about', 'projects', 'skills', 'security'];
    const inputStyleClasses = "w-full px-3 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
    const fileInputStyleClasses = "w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100";
    
    const handleAdminEmailUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setEmailChangeMessage({ type: '', text: '' });
        if (!newAdminEmail || !/^\S+@\S+\.\S+$/.test(newAdminEmail)) {
            setEmailChangeMessage({ type: 'error', text: 'Please enter a valid email address.' });
            return;
        }
        if (window.confirm(`Are you sure you want to change the admin email to ${newAdminEmail}? You will need to log in with this new account.`)) {
            onAdminEmailChange(newAdminEmail);
            setEmailChangeMessage({ type: 'success', text: 'Admin email updated successfully!' });
            setTimeout(() => setEmailChangeMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Content Manager</h2>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                            <img src={adminUser.picture} alt={adminUser.name} className="w-6 h-6 rounded-full mr-2"/>
                            {adminUser.email}
                        </div>
                        <button onClick={onLogout} title="Sign Out" className="flex items-center space-x-2 text-red-500 hover:text-red-600">
                           <FiLogOut /> <span>Sign Out</span>
                        </button>
                    </div>
                </div>
                <div className="flex flex-grow overflow-hidden">
                    <aside className="w-1/4 p-4 border-r dark:border-gray-700">
                        <nav className="flex flex-col space-y-2">
                           {tabs.map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`capitalize text-left px-3 py-2 rounded ${activeTab === tab ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    {tab}
                                </button>
                           ))}
                        </nav>
                    </aside>
                    <main className="w-3/4 p-6 overflow-y-auto">
                        {activeTab === 'general' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">General Info</h3>
                                <div><label className="block text-sm font-medium">Name</label><input type="text" name="name" value={editableData.name} onChange={handleInputChange} className={inputStyleClasses}/></div>
                                <div><label className="block text-sm font-medium">Tagline</label><input type="text" name="tagline" value={editableData.tagline} onChange={handleInputChange} className={inputStyleClasses}/></div>
                                <h3 className="text-lg font-semibold mt-6">Social Links</h3>
                                <div><label className="block text-sm font-medium">GitHub</label><input type="text" name="github" value={editableData.socials.github} onChange={handleSocialChange} className={inputStyleClasses}/></div>
                                <div><label className="block text-sm font-medium">LinkedIn</label><input type="text" name="linkedin" value={editableData.socials.linkedin} onChange={handleSocialChange} className={inputStyleClasses}/></div>
                                <div><label className="block text-sm font-medium">Twitter</label><input type="text" name="twitter" value={editableData.socials.twitter} onChange={handleSocialChange} className={inputStyleClasses}/></div>
                                <div><label className="block text-sm font-medium">Email</label><input type="text" name="email" value={editableData.socials.email} onChange={handleSocialChange} className={inputStyleClasses}/></div>
                                <h3 className="text-lg font-semibold mt-6">Resume</h3>
                                <p className="text-sm text-gray-500 mb-2">Upload a new PDF resume.</p>
                                <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'resumeUrl')} className={fileInputStyleClasses}/>
                            </div>
                        )}
                        {activeTab === 'about' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">About Me</h3>
                                <textarea name="about" value={editableData.about} onChange={handleInputChange} rows={8} className={inputStyleClasses}/>
                            </div>
                        )}
                        {activeTab === 'projects' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Projects</h3>
                                    <button onClick={addProject} className="flex items-center space-x-2 text-indigo-500"><FiPlusCircle /> <span>Add Project</span></button>
                                </div>
                                {editableData.projects.map(p => (
                                    <div key={p.id} className="p-4 border rounded-lg dark:border-gray-700 space-y-3">
                                        <div className="flex justify-between items-center"><h4 className="font-bold">{p.title}</h4> <button onClick={() => deleteProject(p.id)} className="text-red-500"><FiTrash2 /></button></div>
                                        <div><label className="block text-sm font-medium">Title</label><input type="text" value={p.title} onChange={(e) => handleProjectChange(p.id, 'title', e.target.value)} className={inputStyleClasses}/></div>
                                        <div><label className="block text-sm font-medium">Description</label><textarea value={p.description} onChange={(e) => handleProjectChange(p.id, 'description', e.target.value)} rows={3} className={inputStyleClasses}/></div>
                                        <div><label className="block text-sm font-medium">Tags (comma separated)</label><input type="text" value={p.tags.join(', ')} onChange={(e) => handleProjectChange(p.id, 'tags', e.target.value)} className={inputStyleClasses}/></div>
                                        <div><label className="block text-sm font-medium">Live URL</label><input type="text" value={p.liveUrl} onChange={(e) => handleProjectChange(p.id, 'liveUrl', e.target.value)} className={inputStyleClasses}/></div>
                                        <div><label className="block text-sm font-medium">GitHub URL</label><input type="text" value={p.githubUrl} onChange={(e) => handleProjectChange(p.id, 'githubUrl', e.target.value)} className={inputStyleClasses}/></div>
                                        <div><label className="block text-sm font-medium">Image</label><input type="file" accept="image/*" onChange={e => handleFileChange(e, 'projectImage', p.id)} className={fileInputStyleClasses}/></div>
                                    </div>
                                ))}
                            </div>
                        )}
                         {activeTab === 'skills' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Skills</h3>
                                {editableData.skills.map((category, catIndex) => (
                                     <div key={catIndex} className="p-4 border rounded-lg dark:border-gray-700 space-y-3">
                                         <h4 className="font-bold">{category.title}</h4>
                                         {category.skills.map((skill, skillIndex) => (
                                             <div key={skillIndex} className="grid grid-cols-3 gap-2 items-center">
                                                <input type="text" value={skill.name} onChange={e => handleSkillChange(catIndex, skillIndex, 'name', e.target.value)} className={inputStyleClasses} placeholder="Skill Name"/>
                                                 <select value={skill.icon} onChange={e => handleSkillChange(catIndex, skillIndex, 'icon', e.target.value)} className={inputStyleClasses}>
                                                    {Object.keys(iconMap).map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                                                 </select>
                                                <input type="color" value={skill.color} onChange={e => handleSkillChange(catIndex, skillIndex, 'color', e.target.value)} className="h-10 w-full p-1 border rounded-md dark:border-gray-700"/>
                                             </div>
                                         ))}
                                     </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'security' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Admin Authorization</h3>
                                {adminEmail === 'admin@example.com' && (
                                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700 rounded-md text-sm">
                                        You are using the default admin email. It's highly recommended to change it to your own Google account email.
                                    </div>
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-400">Set the Google account email that is authorized to access the admin panel.</p>
                                <form onSubmit={handleAdminEmailUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium">Authorized Admin Email</label>
                                        <input type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} className={inputStyleClasses} required/>
                                    </div>
                                    {emailChangeMessage.text && (
                                        <p className={`text-sm ${emailChangeMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                            {emailChangeMessage.text}
                                        </p>
                                    )}
                                    <div className="flex justify-end pt-2">
                                        <NeonButton as="button" type="submit">
                                            Update Admin Email
                                        </NeonButton>
                                    </div>
                                </form>
                            </div>
                        )}
                    </main>
                </div>
                <div className="p-4 border-t dark:border-gray-700 flex justify-end">
                    <NeonButton onClick={() => { onSave(editableData); }}>
                        <FiSave className="mr-2"/> Save Changes
                    </NeonButton>
                </div>
            </div>
        </motion.div>
    );
};

const GoogleSignInPrompt: FC<{ onCorrect: (user: AdminUser) => void; onClose: () => void; adminEmail: string; }> = ({ onCorrect, onClose, adminEmail }) => {
    const [error, setError] = useState('');

    const handleGoogleSignIn = (res: any) => {
        const userObject = jwt_decode<GoogleJwtPayload>(res.credential);
        if (userObject.email === adminEmail) {
            onCorrect({ name: userObject.name, email: userObject.email, picture: userObject.picture });
        } else {
            setError(`Unauthorized. Only ${adminEmail} can log in.`);
            google.accounts.id.disableAutoSelect();
        }
    };
    
    useEffect(() => {
        const googleClientId = document.querySelector<HTMLMetaElement>('meta[name="google-signin-client_id"]')?.content;

        if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
            setError('Google Client ID is not configured.');
            return;
        }

        try {
            google.accounts.id.initialize({
                client_id: googleClientId,
                callback: handleGoogleSignIn,
            });
            google.accounts.id.renderButton(
                document.getElementById('googleSignInButton'),
                { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with' }
            );
            google.accounts.id.prompt(); // Display the One Tap prompt
        } catch (e) {
            console.error("Google Sign-In initialization error", e);
            setError("Could not initialize Google Sign-In.");
        }

    }, []);
    
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[101] flex items-center justify-center p-4">
            <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm"
            >
                <h3 className="text-xl font-bold mb-2 text-center text-gray-800 dark:text-white">Admin Access</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">Sign in with Google to manage content.</p>
                <div id="googleSignInButton" className="flex justify-center mb-4"></div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="flex justify-end pt-2">
                     <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition font-medium">Cancel</button>
                </div>
            </motion.div>
        </div>
    );
};


// Main App Component
const App = () => {
    const [portfolioData, setPortfolioData] = useState<PortfolioData>(defaultPortfolioData);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isSignInPromptVisible, setIsSignInPromptVisible] = useState(false);
    const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('adminEmail') || 'admin@example.com');

    useEffect(() => {
        try {
            const savedData = localStorage.getItem('portfolioData');
            if (savedData) {
                setPortfolioData(JSON.parse(savedData));
            }
        } catch (error) {
            console.error("Failed to parse portfolio data from localStorage", error);
        }
    }, []);

    const updatePortfolioData = (newData: PortfolioData) => {
        localStorage.setItem('portfolioData', JSON.stringify(newData));
        setPortfolioData(newData);
    };
    
    const handleAdminEmailChange = (newEmail: string) => {
        setAdminEmail(newEmail);
        localStorage.setItem('adminEmail', newEmail);
    };

    const handleAdminClick = () => {
        if (adminUser) {
            setIsAdminOpen(true);
        } else {
            setIsSignInPromptVisible(true);
        }
    };

    const handleLoginSuccess = (user: AdminUser) => {
        setIsSignInPromptVisible(false);
        setAdminUser(user);
        setIsAdminOpen(true);
    };
    
    const handleLogout = () => {
        setAdminUser(null);
        setIsAdminOpen(false);
        google.accounts.id.disableAutoSelect();
    };

  return (
    <ThemeProvider>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Navbar />
        <main>
          <Hero data={portfolioData} />
          <About data={portfolioData} />
          <Projects projects={portfolioData.projects} />
          <Skills skills={portfolioData.skills} />
          <Contact />
        </main>
        <Footer data={portfolioData} />
        <ScrollToTopButton />
        <button
            onClick={handleAdminClick}
            className="fixed bottom-8 left-8 bg-gray-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl z-50 hover:bg-gray-600 transition-colors"
            aria-label="Open Admin Panel"
        >
            <FiSettings />
        </button>
        <AnimatePresence>
            {isSignInPromptVisible && <GoogleSignInPrompt onCorrect={handleLoginSuccess} onClose={() => setIsSignInPromptVisible(false)} adminEmail={adminEmail} />}
            {isAdminOpen && adminUser && <AdminPanel data={portfolioData} onSave={updatePortfolioData} onLogout={handleLogout} adminUser={adminUser} adminEmail={adminEmail} onAdminEmailChange={handleAdminEmailChange} />}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
};

export default App;
