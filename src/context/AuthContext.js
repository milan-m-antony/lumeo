import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { toast } from '@/hooks/use-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for an active session
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session ? session.user : null);
        setLoading(false);
    }
    
    getSession();

    // Listen for changes in auth state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session ? session.user : null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
            if (router.isReady) router.push('/gallery');
        }
        if (event === 'PASSWORD_RECOVERY') {
            router.push('/reset-password');
        }
        if (event === 'SIGNED_OUT') {
            // The redirect is handled in the logout function to be more explicit.
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
        throw error;
    }
    toast({
        title: "Registration Successful!",
        description: "Please check your email to confirm your account.",
    });
    router.push('/login');
  };

  const logout = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error && error.name !== 'AuthSessionMissingError') {
            throw error;
        }
    } catch (error) {
        // This case is for when the session is already expired, which is fine.
        if (error.name !== 'AuthSessionMissingError') {
          console.error("Error during sign out:", error);
        }
    } finally {
        setUser(null);
        toast({ title: "You have been logged out." });
        router.push('/');
    }
  };
  
  const sendPasswordResetEmail = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };
  
  const updatePasswordWithToken = async (token, newPassword) => {
    // We need to set the session for the updateUser call to work
    const { data: { session }, error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: token, // Using access token as refresh token as it is not available here
    });

    if (sessionError) {
        // A better approach is to not require a session at all for password updates.
        // We will try to update the user without a session first.
        console.warn("Session error, attempting password update without session:", sessionError);
    }
    
    // The user is now temporarily authenticated with the token. We can update their password.
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    // After a successful password update, it's good practice to sign the user out.
    await supabase.auth.signOut();
    return data;
  }


  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    sendPasswordResetEmail,
    updatePasswordWithToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component to protect routes
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (router.isReady && !loading && !user) {
        router.replace('/login');
      }
    }, [user, loading, router]);

    if (loading || !user) {
      // You can return a loader here
      return null;
    }

    return <Component {...props} />;
  };
}

// A wrapper to fetch data with the user's token
export async function fetchWithAuth(url, options = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
  
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };
  
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  
    const response = await fetch(url, { ...options, headers });
  
    if (response.status === 401) {
      // Handle token expiration or invalid token, e.g., redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  
    return response;
  }
