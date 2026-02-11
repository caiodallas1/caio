
import { User } from '../types';
import { supabase } from './supabase';

export const auth = {
    // Retorna o usuário logado do Supabase
    getCurrentUser: async (): Promise<User | null> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;
        
        return {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || ''
        };
    },

    // Helper para o DB saber quem é o dono dos dados
    getAccessKey: async (): Promise<string | null> => {
        const user = await auth.getCurrentUser();
        return user ? user.id : null;
    },

    login: async (email: string, pass: string): Promise<any> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
        });
        
        if (error) throw error;
        
        window.location.href = '#/';
        window.location.reload();
        return data.user;
    },

    register: async (name: string, email: string, pass: string): Promise<any> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {
                data: { name }
            }
        });

        if (error) throw error;
        
        // Muitos projetos Supabase exigem confirmação de e-mail por padrão. 
        // Se o usuário não logar automaticamente, avisamos.
        if (data.session) {
            window.location.href = '#/';
            window.location.reload();
        } else {
            throw new Error('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.');
        }
        
        return data.user;
    },

    logout: async () => {
        if (confirm('Deseja realmente sair do sistema?')) {
            await supabase.auth.signOut();
            window.location.href = '#/login';
            window.location.reload();
        }
    }
};
