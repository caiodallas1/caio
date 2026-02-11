import { User } from '../types';
import { generateId } from './db';

const KEYS = {
    USERS: 'app_users',
    CURRENT_SESSION: 'app_session'
};

export const auth = {
    register: async (name: string, email: string, password: string) => {
        // Simulating async delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const usersStr = localStorage.getItem(KEYS.USERS);
        const users: User[] = usersStr ? JSON.parse(usersStr) : [];

        if (users.find(u => u.email === email)) {
            throw new Error('E-mail já cadastrado.');
        }

        const newUser: User = {
            id: generateId(),
            name,
            email,
            password
        };

        users.push(newUser);
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(KEYS.CURRENT_SESSION, JSON.stringify(newUser));
        
        // Return object compatible with the page logic expecting confirmationRequired check
        return { confirmationRequired: false };
    },

    login: async (email: string, password: string) => {
        // Simulating async delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const usersStr = localStorage.getItem(KEYS.USERS);
        const users: User[] = usersStr ? JSON.parse(usersStr) : [];
        
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('E-mail ou senha inválidos.');
        }

        localStorage.setItem(KEYS.CURRENT_SESSION, JSON.stringify(user));
        return user;
    },

    logout: async () => {
        localStorage.removeItem(KEYS.CURRENT_SESSION);
        window.location.href = '#/login';
    },

    getCurrentUser: (): User | null => {
        const session = localStorage.getItem(KEYS.CURRENT_SESSION);
        return session ? JSON.parse(session) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem(KEYS.CURRENT_SESSION);
    }
};