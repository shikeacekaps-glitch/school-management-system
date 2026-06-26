import { supabase } from './supabase';
import { User, AuthResponse } from '@/types';

export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  role: string,
  schoolId: string
): Promise<AuthResponse> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { user: null, session: null, error: authError?.message || 'Sign up failed' };
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          full_name: fullName,
          role,
          school_id: schoolId,
          is_active: true,
        },
      ]);

    if (profileError) {
      return { user: null, session: null, error: profileError.message };
    }

    return {
      user: authData.user as any,
      session: authData.session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return { user: null, session: null, error: error?.message || 'Sign in failed' };
    }

    // Fetch user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return { user: null, session: null, error: profileError.message };
    }

    return {
      user: userProfile as User,
      session: data.session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) return null;

    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .single();

    return userProfile as User;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { user: data as User, error: null };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Update failed',
    };
  }
};