import React, { useState, useEffect, ChangeEvent, FC } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiTrash2, FiPlusCircle, FiX } from 'react-icons/fi';

import type { Project, Certificate, Experience, Education, Skill } from './types';
import { PortfolioData } from './portfolio';
import { iconMap } from './iconMap';

const GradientButton: FC<{ children: React.ReactNode; onClick?: () => void; className?: string; type?: 'button' | 'submit' }> = ({ children, onClick, className = '', type = 'button' }) => (
    <button onClick={onClick} className={`inline-flex items-center justify-center px-8 py-3 font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 ${className}`} type={type}>
        {children}
    </button>
);

const inputStyleClasses = "w-full px-3 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
const fileInputStyleClasses = "w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100";

interface EditableSectionProps<T extends { id: number; title?: string; degree?: string }> {
    title: string;
    items: T[];
    newItem: () => T;
    renderFields: (item: T, handleChange: (id: number, field: keyof T, value: any) => void) => React.ReactNode;
    setItems: (items: T[]) => void;
}

function EditableSection<T extends { id: number; title?: string; degree?: string; }>({ title, items, newItem, renderFields, setItems }: EditableSectionProps<T>) {
    
    const handleAddItem = () => {
        setItems([newItem(), ...items]);
    };

    const handleDeleteItem = (id: number) => {
        if (window.confirm(`Are you sure you want to delete this item?`)) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleItemChange = (id: number, field: keyof T, value: any) => {
        setItems(items.map(item => (item.id === id ? { ...item, [field]: value } : item)));
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button onClick={handleAddItem} className="flex items-center space-x-2 text-indigo-500"><FiPlusCircle /> <span>Add New</span></button>
            </div>
            {items.map(item => (
                <div key={item.id} className="p-4 border rounded-lg dark:border-gray-700 space-y-3">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold">{item.title || item.degree}</h4>
                        <button onClick={() => handleDeleteItem(item.id)} className="text-red-500"><FiTrash2 /></button>
                    </div>
                    {renderFields(item, handleItemChange)}
                </div>
            ))}
        </div>
    );
}


const AdminPanel: FC<{ data: PortfolioData; onSave: (newData: PortfolioData) => void; onClose: () => void; }> = ({ data, onSave, onClose }) => {
    const [editableData, setEditableData] = useState<PortfolioData>(data);
    const [activeTab, setActiveTab] = useState('general');
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        setEditableData(data);
    }, [data]);

    useEffect(() => {
        // Auto-save on data change for a smoother experience
        if (JSON.stringify(editableData) !== JSON.stringify(data)) {
           onSave(editableData);
        }
    }, [editableData, data, onSave]);
    
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditableData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditableData(prev => ({ ...prev, socials: { ...prev.socials, [name]: value } }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: string, id?: number) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                if (field === 'heroImage') {
                    setEditableData(prev => ({ ...prev, heroImage: result }));
                } else if (field === 'resumeUrl') {
                    setEditableData(prev => ({ ...prev, resumeUrl: result }));
                } else if (field === 'projectImage' && id !== undefined) {
                    setEditableData(prev => ({ ...prev, projects: prev.projects.map(p => p.id === id ? { ...p, image: result } : p) }));
                } else if (field === 'certificateImage' && id !== undefined) {
                    setEditableData(prev => ({ ...prev, certificates: prev.certificates.map(c => c.id === id ? { ...c, image: result } : c) }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSkillChange = (catIndex: number, skillIndex: number, field: keyof Skill, value: string) => {
        const newSkills = editableData.skills.map((category, cIndex) => {
            if (cIndex !== catIndex) return category;
            return {
                ...category,
                skills: category.skills.map((skill, sIndex) => sIndex === skillIndex ? { ...skill, [field]: value } : skill)
            };
        });
        setEditableData(prev => ({ ...prev, skills: newSkills }));
    };

    const deleteSkill = (catIndex: number, skillIndex: number) => {
        if (!window.confirm("Are you sure you want to delete this skill?")) return;
        const newSkills = editableData.skills.map((category, cIndex) => {
            if (cIndex !== catIndex) return category;
            return {
                ...category,
                skills: category.skills.filter((_, sIndex) => sIndex !== skillIndex),
            };
        });
        setEditableData(prev => ({ ...prev, skills: newSkills }));
    };

    const handleSave = () => {
        onSave(editableData);
        setSaveStatus('Changes saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
    };
    
    const tabs = ['general', 'about', 'experience & education', 'projects', 'certificates', 'skills'];
    
    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Content Manager</h2>
                    <button onClick={onClose} title="Close" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex flex-grow overflow-hidden">
                    <aside className="w-1/4 p-4 border-r dark:border-gray-700 overflow-y-auto">
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
                                 <h3 className="text-lg font-semibold mt-6">Hero Image</h3>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'heroImage')} className={fileInputStyleClasses}/>
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
                        {activeTab === 'experience & education' && (
                            <div className="space-y-8">
                                <EditableSection<Experience>
                                    title="Work Experience"
                                    items={editableData.experiences}
                                    newItem={() => ({ id: Date.now(), title: "Job Title", company: "Company Name", date: "Year - Year", description: "" })}
                                    setItems={(items) => setEditableData(prev => ({ ...prev, experiences: items }))}
                                    renderFields={(item, handleChange) => (
                                        <>
                                            <div><label className="block text-sm font-medium">Title</label><input type="text" value={item.title} onChange={(e) => handleChange(item.id, 'title', e.target.value)} className={inputStyleClasses}/></div>
                                            <div><label className="block text-sm font-medium">Company</label><input type="text" value={item.company} onChange={(e) => handleChange(item.id, 'company', e.target.value)} className={inputStyleClasses}/></div>
                                            <div><label className="block text-sm font-medium">Date</label><input type="text" value={item.date} onChange={(e) => handleChange(item.id, 'date', e.target.value)} className={inputStyleClasses}/></div>
                                            <div><label className="block text-sm font-medium">Description</label><textarea value={item.description} onChange={(e) => handleChange(item.id, 'description', e.target.value)} rows={3} className={inputStyleClasses}/></div>
                                        </>
                                    )}
                                />
                                <EditableSection<Education>
                                    title="Education"
                                    items={editableData.education}
                                    newItem={() => ({ id: Date.now(), degree: "Degree Name", institution: "Institution Name", date: "Year - Year", description: "" })}
                                    setItems={(items) => setEditableData(prev => ({ ...prev, education: items }))}
                                    renderFields={(item, handleChange) => (
                                        <>
                                            <div><label className="block text-sm font-medium">Degree</label><input type="text" value={item.degree} onChange={(e) => handleChange(item.id, 'degree', e.target.value)} className={inputStyleClasses}/></div>
                                            <div><label className="block text-sm font-medium">Institution</label><input type="text" value={item.institution} onChange={(e) => handleChange(item.id, 'institution', e.target.value)} className={inputStyleClasses}/></div>
                                            <div><label className="block text-sm font-medium">Date</label><input type="text" value={item.date} onChange={(e) => handleChange(item.id, 'date', e.target.value)} className={inputStyleClasses}/></div>
                                            <div><label className="block text-sm font-medium">Description</label><textarea value={item.description} onChange={(e) => handleChange(item.id, 'description', e.target.value)} rows={3} className={inputStyleClasses}/></div>
                                        </>
                                    )}
                                />
                            </div>
                        )}
                        {activeTab === 'projects' && (
                             <EditableSection<Project>
                                title="Projects"
                                items={editableData.projects}
                                newItem={() => ({ id: Date.now(), title: "New Project", description: "", image: "https://picsum.photos/seed/new/600/400", tags: [], liveUrl: "#", githubUrl: "#" })}
                                setItems={(items) => setEditableData(prev => ({ ...prev, projects: items }))}
                                renderFields={(item, handleChange) => (
                                    <>
                                        <div><label className="block text-sm font-medium">Title</label><input type="text" value={item.title} onChange={(e) => handleChange(item.id, 'title', e.target.value)} className={inputStyleClasses}/></div>
                                        <div><label className="block text-sm font-medium">Description</label><textarea value={item.description} onChange={(e) => handleChange(item.id, 'description', e.target.value)} rows={3} className={inputStyleClasses}/></div>
                                        <div><label className="block text-sm font-medium">Tags (comma separated)</label><input type="text" value={item.tags.join(', ')} onChange={(e) => handleChange(item.id, 'tags', e.target.value.split(',').map(t=>t.trim()))} className={inputStyleClasses}/></div>
                                        <div><label className="block text-sm font-medium">Live URL</label><input type="text" value={item.liveUrl} onChange={(e) => handleChange(item.id, 'liveUrl', e.target.value)} className={inputStyleClasses}/></div>
                                        <div><label className="block text-sm font-medium">GitHub URL</label><input type="text" value={item.githubUrl} onChange={(e) => handleChange(item.id, 'githubUrl', e.target.value)} className={inputStyleClasses}/></div>
                                        <div><label className="block text-sm font-medium">Image</label><input type="file" accept="image/*" onChange={e => handleFileChange(e, 'projectImage', item.id)} className={fileInputStyleClasses}/></div>
                                    </>
                                )}
                            />
                        )}
                        {activeTab === 'certificates' && (
                            <EditableSection<Certificate>
                                title="Certificates"
                                items={editableData.certificates}
                                newItem={() => ({ id: Date.now(), title: "New Certificate", issuer: "", date: "", credentialUrl: "#", image: "https://picsum.photos/seed/new-cert/600/400" })}
                                setItems={(items) => setEditableData(prev => ({ ...prev, certificates: items }))}
                                renderFields={(item, handleChange) => (
                                    <>
                                        <div><label className="block text-sm font-medium">Title</label><input type="text" value={item.title} onChange={(e) => handleChange(item.id, 'title', e.target.value)} className={inputStyleClasses}/></div>
                                        <div><label className="block text-sm font-medium">Issuer</label><input type="text" value={item.issuer} onChange={(e) => handleChange(item.id, 'issuer', e.target.value)} className={inputStyleClasses}/></div>
                                        <div><label className="block text-sm font-medium">Date</label><input type="text" value={item.date} onChange={(e) => handleChange(item.id, 'date', e.target.value)} className={inputStyleClasses}/></div>
                                        <div><label className="block text-sm font-medium">Credential URL</label><input type="text" value={item.credentialUrl} onChange={(e) => handleChange(item.id, 'credentialUrl', e.target.value)} className={inputStyleClasses}/></div>
                                        <div><label className="block text-sm font-medium">Image</label><input type="file" accept="image/*" onChange={e => handleFileChange(e, 'certificateImage', item.id)} className={fileInputStyleClasses}/></div>
                                    </>
                                )}
                            />
                        )}
                         {activeTab === 'skills' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Skills</h3>
                                {editableData.skills.map((category, catIndex) => (
                                     <div key={catIndex} className="p-4 border rounded-lg dark:border-gray-700 space-y-3">
                                         <h4 className="font-bold">{category.title}</h4>
                                         {category.skills.map((skill, skillIndex) => (
                                             <div key={skillIndex} className="grid grid-cols-[1fr,1fr,auto,auto] gap-2 items-center">
                                                <input type="text" value={skill.name} onChange={e => handleSkillChange(catIndex, skillIndex, 'name', e.target.value)} className={inputStyleClasses} placeholder="Skill Name"/>
                                                 <select value={skill.icon} onChange={e => handleSkillChange(catIndex, skillIndex, 'icon', e.target.value)} className={inputStyleClasses}>
                                                    {Object.keys(iconMap).map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                                                 </select>
                                                <input type="color" value={skill.color} onChange={e => handleSkillChange(catIndex, skillIndex, 'color', e.target.value)} className="h-10 w-16 p-1 border rounded-md dark:border-gray-700"/>
                                                <button onClick={() => deleteSkill(catIndex, skillIndex)} className="text-red-500 hover:text-red-700 transition-colors"><FiTrash2 /></button>
                                             </div>
                                         ))}
                                     </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
                <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center">
                    <span className="text-sm text-green-500">{saveStatus}</span>
                    <GradientButton onClick={handleSave}>
                        <FiSave className="mr-2"/> Save Changes
                    </GradientButton>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminPanel;
