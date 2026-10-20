// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../config/supabase';

const DEMO_ACCOUNTS = {
  'farmer@farmtrace.com': {
    id: 'demo-farmer',
    email: 'farmer@farmtrace.com',
    role: 'farmer',
    name: 'Demo Farmer',
    user_metadata: {
      role: 'farmer',
      name: 'Demo Farmer',
      business_name: 'Green Valley Farm',
      location: 'Punjab, India',
    },
  },
  'logistics@farmtrace.com': {
    id: 'demo-logistics',
    email: 'logistics@farmtrace.com',
    role: 'logistics',
    name: 'Demo Logistics',
    user_metadata: {
      role: 'logistics',
      name: 'Demo Logistics',
      business_name: 'FastMove Logistics',
      location: 'Delhi, India',
    },
  },
  'retailer@farmtrace.com': {
    id: 'demo-retailer',
    email: 'retailer@farmtrace.com',
    role: 'retailer',
    name: 'Demo Retailer',
    user_metadata: {
      role: 'retailer',
      name: 'Demo Retailer',
      business_name: 'FreshMart Store',
      location: 'Mumbai, India',
    },
  },
};

const AuthContext = createContext();

const getDemoUser = () => {
  try {
    const savedUser = localStorage.getItem('demoUser');
    if (!savedUser) return null;
    return JSON.parse(savedUser);
  } catch (error) {
    console.error('Demo session parse error:', error);
    return null;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with true for initial auth check

  // Check for existing session on component mount
  useEffect(() => {
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (session?.user) {
          localStorage.removeItem('demoUser');
          setUser(session.user);
        } else {
          const storedDemoUser = getDemoUser();
          if (storedDemoUser) {
            setUser(storedDemoUser);
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const storedDemoUser = getDemoUser();
      if (storedDemoUser) {
        setUser(storedDemoUser);
        setLoading(false);
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
      }
      if (session?.user) {
        setUser(session.user);
      }
    } catch (error) {
      console.error('Check session error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const demoUserTemplate = DEMO_ACCOUNTS[normalizedEmail];

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      if (error) {
        if (demoUserTemplate && password === `${demoUserTemplate.role.charAt(0).toUpperCase()}${demoUserTemplate.role.slice(1)}@123`) {
          const fallbackUser = {
            ...demoUserTemplate,
            user_metadata: { ...demoUserTemplate.user_metadata },
          };

          localStorage.setItem('demoUser', JSON.stringify(fallbackUser));
          localStorage.setItem('userRole', fallbackUser.role);
          localStorage.setItem('userData', JSON.stringify(fallbackUser));
          localStorage.setItem('isLoggedIn', 'true');
          setUser(fallbackUser);
          return { success: true, user: fallbackUser, demo: true };
        }
        throw error;
      }

      localStorage.removeItem('demoUser');
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const { email, password, name, role, businessName, location } = userData;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          data: {
            name: name.trim(),
            role: role,
            business_name: businessName,
            location: location
          }
        }
      });

      if (error) {
        throw error;
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('demoUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      localStorage.removeItem('isLoggedIn');
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};