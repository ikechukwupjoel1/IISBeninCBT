import { supabase } from './supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, UserRole } from '../types';

/**
 * Authentication Service
 * Handles user authentication and session management
 */

export const authService = {
    /**
     * Sign up a new user
     */
    async signUp(email: string, password: string, userData: Partial<User>) {
        try {
            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Failed to create user');

            // Create user profile
            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email,
                    name: userData.name,
                    role: userData.role || UserRole.STUDENT,
                    reg_number: userData.regNumber,
                    pin: userData.pin,
                    grade: userData.grade,
                    subject: userData.subject,
                    phone: userData.phone,
                    avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=4a7cbd&color=fff`,
                })
                .select()
                .single();

            if (profileError) throw profileError;

            return { user: profileData, error: null };
        } catch (error: any) {
            console.error('Sign up error:', error);
            return { user: null, error: error.message };
        }
    },

    /**
     * Sign in with email and password
     */
    async signInWithEmail(email: string, password: string) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Get user profile
            const profile = await this.getUserProfile(data.user.id);
            
            if (!profile) {
                console.error('Auth successful but no user profile found for ID:', data.user.id);
                throw new Error('Account exists but profile not set up. Please contact administrator.');
            }
            
            return { user: profile, error: null };
        } catch (error: any) {
            console.error('Sign in error:', error);
            return { user: null, error: error.message };
        }
    },

    /**
     * Sign in with student credentials (reg number + PIN)
     * Uses secure PIN hashing via RPC function
     */
    async signInWithStudentCredentials(regNumber: string, pin: string) {
        try {
            // Use RPC function to verify hashed PIN
            const { data, error } = await supabase.rpc('verify_student_login', {
                reg_num: regNumber,
                input_pin: pin
            });

            if (error) {
                console.error('Login RPC error:', error);
                throw new Error('Invalid registration number or PIN');
            }

            // RPC returns array, get first result
            const user = Array.isArray(data) ? data[0] : data;

            if (!user) {
                throw new Error('Invalid registration number or PIN');
            }

            // Persist student session
            localStorage.setItem('iisbenin_user', JSON.stringify(user));

            return { user, error: null };
        } catch (error: any) {
            console.error('Student login error:', error);
            return { user: null, error: error.message };
        }
    },

    /**
     * Sign out current user
     */
    async signOut() {
        try {
            localStorage.removeItem('iisbenin_user');
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            console.error('Sign out error:', error);
            return { error: error.message };
        }
    },

    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        try {
            // 1. Check for Supabase Auth session (Teachers/Admins)
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const profile = await this.getUserProfile(user.id);
                return profile;
            }

            // 2. Check for local student session
            const localUser = localStorage.getItem('iisbenin_user');
            if (localUser) {
                return JSON.parse(localUser);
            }

            return null;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    },

    /**
     * Get user profile by ID
     */
    async getUserProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get user profile error:', error);
            return null;
        }
    },

    /**
     * Update user profile
     */
    async updateProfile(userId: string, updates: Partial<User>) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    name: updates.name,
                    grade: updates.grade,
                    subject: updates.subject,
                    phone: updates.phone,
                    avatar: updates.avatar,
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return { user: data, error: null };
        } catch (error: any) {
            console.error('Update profile error:', error);
            return { user: null, error: error.message };
        }
    },

    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback: (user: User | null) => void) {
        return supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const profile = await this.getUserProfile(session.user.id);
                callback(profile);
            } else {
                callback(null);
            }
        });
    },
};
