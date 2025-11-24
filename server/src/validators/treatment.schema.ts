import * as yup from 'yup';

export const createTreatmentSchema = yup.object().shape({
  name: yup.string().required('Treatment name is required').min(1, 'Treatment name cannot be empty'),
  cost: yup.number().required('Cost is required').positive('Cost must be positive').typeError('Cost must be a number'),
});

export const updateTreatmentSchema = yup.object().shape({
  name: yup.string().min(1, 'Treatment name cannot be empty'),
  cost: yup.number().positive('Cost must be positive').typeError('Cost must be a number'),
});

