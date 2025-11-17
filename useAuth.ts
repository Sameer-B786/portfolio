import { useState, useEffect, useCallback } from 'react';

// Using a simple key for localStorage. In a real app, this would be more secure.
const USER_STORAGE_KEY = 'portfolio_admin_user';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    // Check session storage on initial load
    useEffect(() => {
        try {
            const sessionActive = sessionStorage.getItem('isAdmin') === 'true';
            setIsAuthenticated(sessionActive);
        } catch (error) {
            console.error("Could not access session storage:", error);
            setIsAuthenticated(false);
        }
    }, []);

    const signUp = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
        return new Promise(resolve => {
            setTimeout(() => { // Simulate async operation
                try {
                    const existingUser = localStorage.getItem(USER_STORAGE_KEY);
                    if (existingUser) {
                        resolve({ success: false, message: 'An admin user already exists. Cannot sign up again.' });
                        return;
                    }
                    // In a real app, you would hash the password. For this project, plain text is acceptable.
                    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ email, password }));
                    resolve({ success: true, message: 'Sign up successful! You can now sign in.' });
                } catch (error) {
                     resolve({ success: false, message: 'An error occurred during sign up. Local storage might be disabled.' });
                }
            }, 500);
        });
    }, []);

    const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
         return new Promise(resolve => {
            setTimeout(() => { // Simulate async operation
                try {
                    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
                    if (!storedUser) {
                        resolve({ success: false, message: 'No admin user found. Please sign up first.' });
                        return;
                    }
                
                    const user = JSON.parse(storedUser);
                    if (user.email === email && user.password === password) {
                        sessionStorage.setItem('isAdmin', 'true');
                        setIsAuthenticated(true);
                        resolve({ success: true, message: 'Sign in successful!' });
                    } else {
                        resolve({ success: false, message: 'Invalid email or password.' });
                    }
                } catch (error) {
                    resolve({ success: false, message: 'An error occurred during sign in. Local storage might be disabled.' });
                }
            }, 500);
        });
    }, []);

    const signOut = useCallback(() => {
        try {
            sessionStorage.removeItem('isAdmin');
        } catch (error) {
            console.error("Could not access session storage:", error);
        }
        setIsAuthenticated(false);
    }, []);

    return { isAuthenticated, signUp, signIn, signOut };
}
