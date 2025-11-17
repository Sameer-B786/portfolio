import React, { useState, useEffect, createContext, useContext, useMemo, FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as ScrollLink, Events, scrollSpy, scroller } from 'react-scroll';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa';
import { FiSun, FiMoon, FiMenu, FiX, FiDownload, FiSend, FiArrowUp, FiSettings } from 'react-icons/fi';

import { Project, SkillCategory, Certificate } from './types';
import { usePortfolioData } from './usePortfolioData';
import { PortfolioData } from './portfolio';
import AdminPanel from './AdminPanel';
import { iconMap } from './iconMap';
import { sanitizeUrl } from './sanitize';

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

const GradientButton: FC<{ children: React.ReactNode; onClick?: (e: React.MouseEvent) => void; href?: string; download?: boolean | string, className?: string; as?: 'button' | 'a'; type?: 'button' | 'submit' }> = ({ children, onClick, href, download = false, className = '', as = 'button', type = 'button' }) => {
  const commonClasses = `
    inline-flex items-center justify-center px-8 py-3 font-bold text-white 
    bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full 
    shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 ${className}
  `;

  if (as === 'a') {
    return (
        <a href={href} download={download} className={commonClasses} target="_blank" rel="noopener noreferrer" onClick={onClick}>
            {children}
        </a>
    );
  }

  return (
    <button onClick={onClick} className={commonClasses} type={type}>
      {children}
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

    const navLinks = ["home", "about", "projects", "certificates", "skills", "contact"];
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

    const handleHireMeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        scroller.scrollTo('contact', {
          duration: 800,
          delay: 0,
          smooth: 'easeInOutQuart',
          offset: -70
        });
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
                             <GradientButton as="a" href="#contact" onClick={handleHireMeClick}>Hire Me</GradientButton>
                             <GradientButton as="a" href={sanitizeUrl(data.resumeUrl)} download="Sameer-Bavaji-Resume.pdf">
                                 <FiDownload className="mr-2"/> Download CV
                             </GradientButton>
                        </div>
                         <div className="flex justify-center md:justify-start space-x-6">
                            <a href={sanitizeUrl(data.socials.github)} target="_blank" rel="noreferrer" aria-label="GitHub" className="text-2xl text-gray-500 hover:text-indigo-500 transition-colors"><FaGithub /></a>
                            <a href={sanitizeUrl(data.socials.linkedin)} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-2xl text-gray-500 hover:text-indigo-500 transition-colors"><FaLinkedin /></a>
                            <a href={sanitizeUrl(data.socials.twitter)} target="_blank" rel="noreferrer" aria-label="Twitter" className="text-2xl text-gray-500 hover:text-indigo-500 transition-colors"><FaTwitter /></a>
                            <a href={sanitizeUrl(data.socials.email)} aria-label="Email" className="text-2xl text-gray-500 hover:text-indigo-500 transition-colors"><FaEnvelope /></a>
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
                            <img src={data.heroImage} alt={data.name} className="relative w-full h-full object-cover rounded-full shadow-2xl border-4 border-white dark:border-gray-800" />
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
        <div className="max-w-4xl mx-auto text-center">
             <p className="text-lg text-gray-600 dark:text-gray-300 mb-16">{data.about}</p>
             <div className="grid md:grid-cols-2 gap-16 text-left">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 text-center">Experience</h3>
                    <div className="relative border-l-2 border-indigo-200 dark:border-indigo-800">
                        {data.experiences.map((exp, index) => (
                            <motion.div
                                key={exp.id}
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
                 <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 text-center">Education</h3>
                    <div className="relative border-l-2 border-indigo-200 dark:border-indigo-800">
                        {data.education.map((edu, index) => (
                            <motion.div
                                key={edu.id}
                                className="mb-10 ml-6"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-200 rounded-full -left-3 ring-8 ring-white dark:ring-gray-800 dark:bg-indigo-900">
                                    <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002 2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
                                </span>
                                <h4 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">{edu.degree} <span className="bg-indigo-100 text-indigo-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300 ml-3">{edu.date}</span></h4>
                                <p className="block mb-2 text-sm font-normal leading-none text-gray-500 dark:text-gray-400">{edu.institution}</p>
                                <p className="mb-4 text-base font-normal text-gray-600 dark:text-gray-300">{edu.description}</p>
                            </motion.div>
                        ))}
                    </div>
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
                                    <a href={sanitizeUrl(project.liveUrl)} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Live Demo</a>
                                    <a href={sanitizeUrl(project.githubUrl)} target="_blank" rel="noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors text-2xl"><FaGithub /></a>
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

const Certificates: FC<{certificates: Certificate[]}> = ({certificates}) => (
    <Section id="certificates" className="bg-white dark:bg-gray-800">
        <SectionTitle>Certificates & Awards</SectionTitle>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificates.map((cert) => (
                <motion.div
                    key={cert.id}
                    className="bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="overflow-hidden">
                        <img src={cert.image} alt={cert.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"/>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{cert.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-1"><span className="font-semibold">Issuer:</span> {cert.issuer}</p>
                        <p className="text-gray-600 dark:text-gray-400 mb-4"><span className="font-semibold">Date:</span> {cert.date}</p>
                        <a href={sanitizeUrl(cert.credentialUrl)} target="_blank" rel="noreferrer" className="font-bold text-indigo-500 hover:underline">
                            View Credential
                        </a>
                    </div>
                </motion.div>
            ))}
        </div>
    </Section>
);

const Skills: FC<{skills: SkillCategory[]}> = ({skills}) => (
    <Section id="skills">
        <SectionTitle>My Skills</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skills.map((category, index) => (
                <motion.div 
                    key={category.title} 
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
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
                                <div key={skill.name} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
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
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const subject = encodeURIComponent(`Portfolio Contact from ${formData.name}`);
        const body = encodeURIComponent(
`Name: ${formData.name}
Email: ${formData.email}

Message:
${formData.message}`
        );
        
        window.location.href = `mailto:sameerbavaji63@gmail.com?subject=${subject}&body=${body}`;

        setStatus('Redirecting to your email client to send the message!');
        setTimeout(() => setStatus(''), 5000);
        setFormData({ name: '', email: '', message: '' }); // Reset form state
    };

    return (
        <Section id="contact">
            <SectionTitle>Get In Touch</SectionTitle>
            <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>
                    <textarea
                        name="message"
                        placeholder="Your Message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    ></textarea>
                    <div className="text-center">
                        <GradientButton as="button" type="submit" className="w-full md:w-auto">
                            Send Message <FiSend className="ml-2"/>
                        </GradientButton>
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
                <a href={sanitizeUrl(data.socials.github)} target="_blank" rel="noreferrer" aria-label="GitHub" className="text-xl hover:text-indigo-500 transition-colors"><FaGithub /></a>
                <a href={sanitizeUrl(data.socials.linkedin)} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-xl hover:text-indigo-500 transition-colors"><FaLinkedin /></a>
                <a href={sanitizeUrl(data.socials.twitter)} target="_blank" rel="noreferrer" aria-label="Twitter" className="text-xl hover:text-indigo-500 transition-colors"><FaTwitter /></a>
                <a href={sanitizeUrl(data.socials.email)} aria-label="Email" className="text-xl hover:text-indigo-500 transition-colors"><FaEnvelope /></a>
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

// Main App Component
const App = () => {
    const [portfolioData, updatePortfolioData] = usePortfolioData();
    const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Navbar />
        <main>
          <Hero data={portfolioData} />
          <About data={portfolioData} />
          <Projects projects={portfolioData.projects} />
          <Certificates certificates={portfolioData.certificates} />
          <Skills skills={portfolioData.skills} />
          <Contact />
        </main>
        <Footer data={portfolioData} />
        <ScrollToTopButton />
        <button
            onClick={() => setIsAdminOpen(true)}
            className="fixed bottom-8 left-8 bg-gray-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl z-50 hover:bg-gray-600 transition-colors"
            aria-label="Open Admin Panel"
        >
            <FiSettings />
        </button>
        <AnimatePresence>
            {isAdminOpen && <AdminPanel data={portfolioData} onSave={updatePortfolioData} onClose={() => setIsAdminOpen(false)} />}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
};

export default App;
