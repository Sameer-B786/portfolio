import React, { useState, FC } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiLogIn, FiUserPlus, FiLoader } from 'react-icons/fi';
import GradientButton from './GradientButton';

const inputStyleClasses = "w-full px-3 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";

interface AuthProps {
    onClose: () => void;
    onSignIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    onSignUp: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    onSuccess: () => void;
}

const Auth: FC<AuthProps> = ({ onClose, onSignIn, onSignUp, onSuccess }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        const action = isSignUp ? onSignUp : onSignIn;
        const result = await action(email, password);
        
        setIsLoading(false);

        if (result.success) {
            if (isSignUp) {
                setMessage(result.message);
                // Switch to sign-in view after successful sign-up
                setTimeout(() => {
                    setIsSignUp(false);
                    setMessage('');
                }, 2000);
            } else {
                onSuccess();
            }
        } else {
            setError(result.message);
        }
    };
    
    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{y: -50, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                exit={{y: 50, opacity: 0}}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md"
            >
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{isSignUp ? 'Admin Sign Up' : 'Admin Sign In'}</h2>
                    <button onClick={onClose} title="Close" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputStyleClasses} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputStyleClasses} required />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {message && <p className="text-sm text-green-500">{message}</p>}
                    <GradientButton type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <FiLoader className="animate-spin mr-2" /> : (isSignUp ? <FiUserPlus className="mr-2" /> : <FiLogIn className="mr-2" />)}
                        {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </GradientButton>
                    <p className="text-center text-sm">
                        {isSignUp ? "Already have an account?" : "No account?"}{' '}
                        <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }} className="text-indigo-500 hover:underline">
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default Auth;
