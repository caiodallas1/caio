
import { User } from '../types';

const STORAGE_KEY = 'gestor_pro_access_key';

export const auth = {
    // Retorna a chave de acesso salva ou null
    getAccessKey: (): string | null => {
        return localStorage.getItem(STORAGE_KEY);
    },

    // Define uma nova chave
    setAccessKey: (key: string) => {
        localStorage.setItem(STORAGE_KEY, key.trim().toUpperCase());
        window.location.reload();
    },

    // Gera uma chave aleatória amigável
    generateKey: (): string => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = 'GPRO-';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    // Limpa a chave (Logout)
    logout: () => {
        if (confirm('Isso removerá o acesso neste dispositivo. Certifique-se de ter sua chave anotada para entrar novamente. Sair?')) {
            localStorage.removeItem(STORAGE_KEY);
            window.location.href = '/';
        }
    },

    // Mock do usuário para manter compatibilidade com o Layout
    getCurrentUser: (): User | null => {
        const key = localStorage.getItem(STORAGE_KEY);
        if (!key) return null;
        return {
            id: key,
            name: 'Minha Empresa',
            email: key
        };
    },

    // Fix: Added register method to fix 'Property register does not exist' error in Register.tsx
    register: async (name: string, email: string, pass: string) => {
        // Return a mock response as the system uses Key-based access
        return { confirmationRequired: true };
    }
};
