import { useState, useEffect } from 'react';
import { defaultPortfolioData, PortfolioData } from './portfolio';

export function usePortfolioData(): [PortfolioData, (newData: PortfolioData) => void] {
    const [portfolioData, setPortfolioData] = useState<PortfolioData>(defaultPortfolioData);

    useEffect(() => {
        try {
            const savedData = localStorage.getItem('portfolioData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Deep merge with default data to prevent crashes if data shape changes
                const mergedData = { 
                    ...defaultPortfolioData, 
                    ...parsedData,
                    socials: { ...defaultPortfolioData.socials, ...parsedData.socials },
                    skills: parsedData.skills || defaultPortfolioData.skills,
                    projects: parsedData.projects || defaultPortfolioData.projects,
                    certificates: parsedData.certificates || defaultPortfolioData.certificates,
                    experiences: parsedData.experiences || defaultPortfolioData.experiences,
                    education: parsedData.education || defaultPortfolioData.education,
                };
                setPortfolioData(mergedData);
            }
        } catch (err) {
            console.error("Failed to parse portfolio data from localStorage", err);
        }
    }, []);

    const updatePortfolioData = (newData: PortfolioData) => {
        localStorage.setItem('portfolioData', JSON.stringify(newData));
        setPortfolioData(newData);
    };

    return [portfolioData, updatePortfolioData];
}
