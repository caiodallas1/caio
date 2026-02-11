import GoTrue from 'gotrue-js';
import { User } from '../types';

// Initialize GoTrue
// The APIUrl is relative so it works on the deployed Netlify site.
// For local development, this requires 'netlify dev' or manually setting the full URL 
// (e.g. 'https://seu-site.netlify.app/.netlify/identity') if you are just opening index.html
const goTrueAuth = new GoTrue({
  APIUrl: '/.netlify/identity',
  setCookie: true,
});

export const auth = {
    register: async (name: string, email: string, password: string) => {
        try {
            const res = await goTrueAuth.signup(email, password, { full_name: name });
            // Check if email confirmation is required (default behavior in Netlify Identity)
            if (!res.confirmed_at) {
                return { confirmationRequired: true };
            }
            // If already confirmed (e.g. disabled email confirmation), try to login
            return auth.login(email, password);
        } catch (error: any) {
            // Translate common errors
            let msg = error.message;
            if (msg.includes('already registered')) msg = 'Este e-mail já está cadastrado.';
            throw new Error(msg || 'Erro ao registrar');
        }
    },

    login: async (email: string, password: string) => {
        try {
             const user = await goTrueAuth.login(email, password);
             return mapUser(user);
        } catch (error: any) {
             let msg = error.message;
             if (msg.includes('invalid_grant')) msg = 'E-mail ou senha inválidos.';
             throw new Error(msg || 'Erro ao entrar');
        }
    },

    logout: async () => {
        try {
            const user = goTrueAuth.currentUser();
            if (user) await user.logout();
            window.location.href = '#/login';
        } catch (error) {
            console.error(error);
            window.location.href = '#/login';
        }
    },

    getCurrentUser: (): User | null => {
        const user = goTrueAuth.currentUser();
        return user ? mapUser(user) : null;
    },

    isAuthenticated: () => {
        return !!goTrueAuth.currentUser();
    }
};

function mapUser(goTrueUser: any): User {
    return {
        id: goTrueUser.id,
        email: goTrueUser.email,
        name: goTrueUser.user_metadata?.full_name || goTrueUser.email.split('@')[0]
    };
}