// middleware/auth.js - COMPLETE FIXED VERSION
import { supabase } from '../config/supabase.js';

// JWT Token Authentication
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Use Supabase auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token authentication error:', error);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

// Supabase JWT Authentication
export const authenticateSupabase = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Supabase authentication error:', error);
    return res.status(403).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Role-based Authorization
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRole = req.user.user_metadata?.role || req.user.role;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// ✅ FIXED: Export all functions as named exports
export default {
  authenticateToken,
  authenticateSupabase,
  requireRole
};