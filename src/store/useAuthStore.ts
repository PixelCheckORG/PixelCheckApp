import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    sessionId: string | null;
    initialize: () => Promise<void>;
    signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    getSessionId: () => string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: true,
    sessionId: null,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    set({ user: profile, isLoading: false });
                } else {
                    set({ user: null, isLoading: false });
                }
            } else {
                // Usuario no registrado: generar session_id
                const existingSessionId = localStorage.getItem('guest_session_id');
                const sessionId = existingSessionId || crypto.randomUUID();
                
                if (!existingSessionId) {
                    localStorage.setItem('guest_session_id', sessionId);
                }
                
                set({ user: null, sessionId, isLoading: false });
            }

            // Escuchar cambios de autenticación
            supabase.auth.onAuthStateChange(async (event, session) => {
                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        set({ user: profile });
                        // Limpiar session_id de invitado al iniciar sesión
                        localStorage.removeItem('guest_session_id');
                        set({ sessionId: null });
                    }
                } else {
                    set({ user: null });
                    // Generar nuevo session_id si no existe
                    const existingSessionId = localStorage.getItem('guest_session_id');
                    if (!existingSessionId) {
                        const newSessionId = crypto.randomUUID();
                        localStorage.setItem('guest_session_id', newSessionId);
                        set({ sessionId: newSessionId });
                    }
                }
            });
        } catch (error) {
            console.error('Error initializing auth:', error);
            set({ isLoading: false });
        }
    },

    signUp: async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    },

    signIn: async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    },

    signOut: async () => {
        try {
            await supabase.auth.signOut();
            // Generar nuevo session_id para invitado
            const newSessionId = crypto.randomUUID();
            localStorage.setItem('guest_session_id', newSessionId);
            set({ user: null, sessionId: newSessionId });
        } catch (error) {
            console.error('Error signing out:', error);
        }
    },

    getSessionId: () => {
        const state = get();
        if (state.user) return state.user.id;
        
        const existingSessionId = localStorage.getItem('guest_session_id');
        if (existingSessionId) return existingSessionId;
        
        const newSessionId = crypto.randomUUID();
        localStorage.setItem('guest_session_id', newSessionId);
        set({ sessionId: newSessionId });
        return newSessionId;
    },
}));
