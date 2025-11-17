import type { Project, SkillCategory, Experience, Certificate, Education } from './types';

export const defaultPortfolioData = {
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
    experiences: [] as Experience[],
    education: [] as Education[],
    skills: [
        { title: "Frontend", skills: [ { name: "React", icon: "FaReact", color: "#61DAFB" }, { name: "Next.js", icon: "SiNextdotjs", color: "#000000" }, { name: "Vue.js", icon: "FaVuejs", color: "#4FC08D" }, { name: "TypeScript", icon: "SiTypescript", color: "#3178C6" }, { name: "JavaScript", icon: "SiJavascript", color: "#F7DF1E" }, { name: "HTML5", icon: "SiHtml5", color: "#E34F26" }, { name: "CSS3", icon: "SiCss3", color: "#1572B6" }, { name: "Tailwind CSS", icon: "SiTailwindcss", color: "#06B6D4" } ] },
        { title: "Backend", skills: [ { name: "Node.js", icon: "FaNodeJs", color: "#339933" }, { name: "Express", icon: "SiExpress", color: "#000000" }, { name: "PostgreSQL", icon: "SiPostgresql", color: "#4169E1" }, { name: "MongoDB", icon: "SiMongodb", color: "#47A248" }, { name: "Redis", icon: "SiRedis", color: "#DC382D" } ] },
        { title: "Cloud & DevOps", skills: [ { name: "AWS", icon: "FaAws", color: "#FF9900" }, { name: "Docker", icon: "FaDocker", color: "#2496ED" }, { name: "Git", icon: "FaGitAlt", color: "#F05032" } ] },
        { title: "Tools", skills: [ { name: "Vite", icon: "SiVite", color: "#646CFF" }, { name: "Webpack", icon: "SiWebpack", color: "#8DD6F9" }, { name: "Jest", icon: "SiJest", color: "#C21325" }, { name: "Figma", icon: "FaFigma", color: "#F24E1E" } ] }
    ] as SkillCategory[],
    projects: [] as Project[],
    certificates: [] as Certificate[]
};

export type PortfolioData = typeof defaultPortfolioData;