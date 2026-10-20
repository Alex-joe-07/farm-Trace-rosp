// middleware/validation.js - FIXED VERSION
export const validateSignup = (req, res, next) => {
  const { email, password, name, role, businessName, location } = req.body;

  console.log('🔍 Validating signup data:', { email, name, role, businessName, location });

  const errors = [];

  // Email validation - more flexible for development
  if (!email || !email.includes('@')) {
    errors.push('Valid email address is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim().toLowerCase())) {
      errors.push('Please enter a valid email address (format: user@domain.com)');
    }
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters long');
  }

  // Role validation
  const validRoles = ['farmer', 'logistics', 'retailer'];
  if (!role || !validRoles.includes(role)) {
    errors.push(`Valid role is required. Options: ${validRoles.join(', ')}`);
  }

  // Business name validation for specific roles
  if (role && role !== 'consumer' && (!businessName || businessName.trim().length < 2)) {
    errors.push('Business name is required for your selected role');
  }

  if (errors.length > 0) {
    console.log('❌ Validation errors:', errors);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  console.log('✅ Validation passed');
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  console.log('🔍 Validating login data:', { email });

  const errors = [];

  // More flexible email validation for login
  if (!email || !email.includes('@')) {
    errors.push('Valid email address is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    console.log('❌ Login validation errors:', errors);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  console.log('✅ Login validation passed');
  next();
};