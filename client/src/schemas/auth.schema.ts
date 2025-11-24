import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;

export const signupSchema = yup.object({
  full_name: yup
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .trim()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  role: yup
    .string()
    .oneOf(['patient', 'doctor', 'finance'], 'Invalid role')
    .required('Role is required'),
});

export type SignupFormValues = yup.InferType<typeof signupSchema>;

