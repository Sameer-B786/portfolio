import React, { useState, useEffect, createContext, useContext, useMemo, FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as ScrollLink, Events, scrollSpy, scroller } from 'react-scroll';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa';
import { FiSun, FiMoon, FiMenu, FiX, FiDownload, FiSend, FiArrowUp, FiSettings, FiLock } from 'react-icons/fi';

import { Project, SkillCategory, Certificate, Experience, Education } from './types';
import { usePortfolioData } from './usePortfolioData';
import { PortfolioData } from './portfolio';
import AdminPanel from './AdminPanel';
import { iconMap } from './iconMap';
import { sanitizeUrl } from './sanitize';
import GradientButton from './GradientButton';
import { useAuth } from './useAuth';
import Auth from './Auth';

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

// SECTIONS
const Navbar: FC<{ data: PortfolioData }> = ({ data }) => {
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
                    {data.name.split(' ').map(n => n[0]).join('') || 'SB'}
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
                    <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
                        <FiMenu className="w-6 h-6 text-gray-800 dark:text-white" />
                    </button>
                </div>
            </div>
            <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg"
                >
                    <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
                         {navLinks.map(link => (
                            <ScrollLink key={link} to={link} spy={true} smooth={true} offset={-70} duration={500} className={linkClasses} activeClass={activeLinkClasses} onClick={() => setIsOpen(false)}>
                                {link}
                            </ScrollLink>
                        ))}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </nav>
    );
};

const Hero: FC<{ data: PortfolioData }> = ({ data }) => {
    const socialIcons = useMemo(() => [
        { href: sanitizeUrl(data.socials.github), icon: FaGithub, label: 'GitHub' },
        { href: sanitizeUrl(data.socials.linkedin), icon: FaLinkedin, label: 'LinkedIn' },
        { href: sanitizeUrl(data.socials.twitter), icon: FaTwitter, label: 'Twitter' },
        { href: sanitizeUrl(data.socials.email), icon: FaEnvelope, label: 'Email' },
    ], [data.socials]);

    return (
        <Section id="home" className="min-h-screen flex items-center bg-gray-100 dark:bg-gray-800/50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center text-center">
                    <motion.h1
                        className="text-4xl md:text-6xl font-extrabold text-gray-800 dark:text-white mb-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{data.name}</span>
                    </motion.h1>
                    <motion.p
                        className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {data.tagline}
                    </motion.p>
                    <motion.div
                        className="flex flex-wrap justify-center items-center gap-4 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <GradientButton as="a" href={sanitizeUrl(data.resumeUrl)} download="resume.pdf">
                            <FiDownload className="mr-2"/> Download Resume
                        </GradientButton>
                        <ScrollLink to="contact" smooth={true} duration={500}>
                           <GradientButton as="button">
                                <FiSend className="mr-2"/> Contact Me
                           </GradientButton>
                        </ScrollLink>
                    </motion.div>
                    <motion.div
                        className="flex space-x-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        {socialIcons.map(({ href, icon: Icon, label }) => (
                            <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="text-2xl text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transform hover:scale-125 transition-all duration-300">
                                <Icon />
                            </a>
                        ))}
                    </motion.div>
                </div>
            </div>
        </Section>
    );
};

const About: FC<{ data: PortfolioData }> = ({ data }) => (
    <Section id="about">
        <SectionTitle>About Me</SectionTitle>
        <div className="max-w-3xl mx-auto text-center text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
           <p>{data.about}</p>
        </div>
    </Section>
);

const Timeline: FC<{ experiences: PortfolioData['experiences']; education: PortfolioData['education'] }> = ({ experiences, education }) => {
    const timelineItems = [
        ...experiences.map(e => ({ ...e, type: 'experience' as const })),
        ...education.map(e => ({ ...e, type: 'education' as const }))
    ].sort((a, b) => parseInt(b.date.split(' - ')[0]) - parseInt(a.date.split(' - ')[0]));

    if (timelineItems.length === 0) return null;

    return (
        <Section id="experience">
            <SectionTitle>Experience & Education</SectionTitle>
            <div className="relative max-w-4xl mx-auto">
                <div className="absolute left-1/2 w-0.5 h-full bg-gray-200 dark:bg-gray-700 transform -translate-x-1/2"></div>
                {timelineItems.map((item, index) => (
                    <div key={item.id} className="relative mb-8">
                        <div className={`flex items-center ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                            <div className="w-1/2"></div>
                            <div className="w-1/2 px-4">
                                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                                    <span className="text-sm font-semibold text-indigo-500 dark:text-indigo-400">{item.date}</span>
                                    {/* FIX: Use conditional rendering to satisfy TypeScript's type narrowing for union types. */}
                                    {item.type === 'experience' ? (
                                        <>
                                            <h3 className="text-xl font-bold mt-1">{item.title}</h3>
                                            <p className="text-md text-gray-500 dark:text-gray-400 mb-2">{item.company}</p>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-xl font-bold mt-1">{item.degree}</h3>
                                            <p className="text-md text-gray-500 dark:text-gray-400 mb-2">{item.institution}</p>
                                        </>
                                    )}
                                    <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                                </div>
                            </div>
                        </div>
                         <div className="absolute left-1/2 w-4 h-4 bg-indigo-500 rounded-full transform -translate-x-1/2 -translate-y-4 top-1/2 border-4 border-white dark:border-gray-800"></div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

const Projects: FC<{ projects: Project[] }> = ({ projects }) => {
    if (projects.length === 0) return null;
    return (
        <Section id="projects" className="bg-gray-100 dark:bg-gray-800/50">
            <SectionTitle>My Projects</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map(project => (
                    <motion.div
                        key={project.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group"
                        // FIX: Use 'boxShadow' instead of 'shadow' for framer-motion hover animation.
                        whileHover={{ y: -10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        transition={{ duration: 0.3 }}
                    >
                        <img src={sanitizeUrl(project.image)} alt={project.title} className="w-full h-56 object-cover" />
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 rounded-full text-sm">{tag}</span>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-4">
                               <a href={sanitizeUrl(project.liveUrl)} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Live Demo</a>
                               <a href={sanitizeUrl(project.githubUrl)} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-500"><FaGithub className="w-6 h-6"/></a>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Section>
    );
};


const Certificates: FC<{ certificates: Certificate[] }> = ({ certificates }) => {
    if (certificates.length === 0) return null;
    return (
        <Section id="certificates">
            <SectionTitle>Certificates</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certificates.map(cert => (
                    <motion.div
                        key={cert.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group"
                        // FIX: Use 'boxShadow' instead of 'shadow' for framer-motion hover animation.
                        whileHover={{ y: -10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        transition={{ duration: 0.3 }}
                    >
                         <a href={sanitizeUrl(cert.credentialUrl)} target="_blank" rel="noopener noreferrer">
                             <img src={sanitizeUrl(cert.image)} alt={cert.title} className="w-full h-56 object-cover" />
                         </a>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-2">{cert.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">Issued by: {cert.issuer}</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm">Date: {cert.date}</p>
                            <a href={sanitizeUrl(cert.credentialUrl)} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline mt-4 inline-block">View Credential</a>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Section>
    )
};


const Skills: FC<{ skills: SkillCategory[] }> = ({ skills }) => {
    if (skills.length === 0) return null;
    return (
        <Section id="skills" className="bg-gray-100 dark:bg-gray-800/50">
            <SectionTitle>Skills</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {skills.map(category => (
                    <div key={category.title}>
                        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-700 dark:text-gray-200">{category.title}</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            {category.skills.map(skill => {
                                const Icon = iconMap[skill.icon] || (() => <div />);
                                return (
                                    <div key={skill.name} className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-28 h-28 justify-center">
                                        <Icon style={{ color: skill.color }} className="text-4xl mb-2" />
                                        <span className="text-sm font-medium">{skill.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

const Contact: FC<{ email: string }> = ({ email }) => (
    <Section id="contact">
        <SectionTitle>Get In Touch</SectionTitle>
        <div className="max-w-xl mx-auto text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                I'm currently open to new opportunities and collaborations. Feel free to reach out to me!
            </p>
            <GradientButton as="a" href={sanitizeUrl(email)}>
                <FiSend className="mr-2"/> Say Hello
            </GradientButton>
        </div>
    </Section>
);

const Footer: FC<{ name: string; socials: PortfolioData['socials'] }> = ({ name, socials }) => {
    const socialIcons = useMemo(() => [
        { href: sanitizeUrl(socials.github), icon: FaGithub, label: 'GitHub' },
        { href: sanitizeUrl(socials.linkedin), icon: FaLinkedin, label: 'LinkedIn' },
        { href: sanitizeUrl(socials.twitter), icon: FaTwitter, label: 'Twitter' },
        { href: sanitizeUrl(socials.email), icon: FaEnvelope, label: 'Email' },
    ], [socials]);
    
    return (
        <footer className="bg-white dark:bg-gray-800 py-8">
            <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
                <div className="flex justify-center space-x-6 mb-4">
                    {socialIcons.map(({ href, icon: Icon, label }) => (
                         <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                             <Icon />
                         </a>
                    ))}
                </div>
                <p>&copy; {new Date().getFullYear()} {name}. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

const ScrollToTopButton: FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        scroller.scrollTo('home', {
            duration: 800,
            delay: 0,
            smooth: 'easeInOutQuart'
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-indigo-500 text-white p-3 rounded-full shadow-lg hover:bg-indigo-600 transition-colors z-50"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    aria-label="Scroll to top"
                >
                    <FiArrowUp className="w-6 h-6" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

const App: FC = () => {
  const [portfolioData, updatePortfolioData] = usePortfolioData();
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, signIn, signUp, signOut } = useAuth();

  const handleAdminAccess = () => {
      if (isAuthenticated) {
          setIsAdminPanelOpen(true);
      } else {
          setIsAuthModalOpen(true);
      }
  };

  const handleSignOut = () => {
      signOut();
      setIsAdminPanelOpen(false);
  };
  
  const handleAuthSuccess = () => {
      setIsAuthModalOpen(false);
      setIsAdminPanelOpen(true);
  };

  return (
    <ThemeProvider>
       <div className="text-gray-800 dark:text-gray-100">
            <Navbar data={portfolioData} />
            <main>
                <Hero data={portfolioData} />
                <About data={portfolioData} />
                <Timeline experiences={portfolioData.experiences} education={portfolioData.education} />
                <Projects projects={portfolioData.projects} />
                <Certificates certificates={portfolioData.certificates} />
                <Skills skills={portfolioData.skills} />
                <Contact email={portfolioData.socials.email} />
            </main>
            <Footer name={portfolioData.name} socials={portfolioData.socials}/>
            <ScrollToTopButton />

            <button
                onClick={handleAdminAccess}
                className="fixed bottom-8 left-8 bg-gray-700 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors z-50"
                aria-label="Open Content Manager"
            >
                {isAuthenticated ? <FiSettings className="w-6 h-6" /> : <FiLock className="w-6 h-6" />}
            </button>

            <AnimatePresence>
                {isAdminPanelOpen && isAuthenticated && <AdminPanel data={portfolioData} onSave={updatePortfolioData} onClose={() => setIsAdminPanelOpen(false)} onSignOut={handleSignOut} />}
            </AnimatePresence>
            
            <AnimatePresence>
                {isAuthModalOpen && <Auth onClose={() => setIsAuthModalOpen(false)} onSignIn={signIn} onSignUp={signUp} onSuccess={handleAuthSuccess} />}
            </AnimatePresence>
       </div>
    </ThemeProvider>
  );
}

export default App;
