import * as yup from 'yup';

export const signupSchema = yup.object().shape({
  full_name: yup.string().required('Full name is required').min(2, 'Full name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  role: yup.string().oneOf(['patient', 'doctor', 'finance'], 'Invalid role').required('Role is required'),
});

export const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const refreshTokenSchema = yup.object().shape({
  refreshToken: yup.string(),
});

