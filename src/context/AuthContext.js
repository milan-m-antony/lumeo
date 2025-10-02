
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
        
        if (event === 'SIGNED_OUT') {
            router.replace('/login');
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
        variant: "success",
    });
    router.push('/login');
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error && error.name !== 'AuthSessionMissingError') {
      console.error('Error logging out:', error);
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: 'destructive',
      });
    } else {
       toast({ title: "You have been logged out." });
    }
    // The onAuthStateChange listener will handle the redirect.
  };
  
  const value = {
    user,
    loading,
    login,
    signup,
    logout,
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
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
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
