import * as yup from 'yup';

const now = () => new Date();

export const appointmentBookingSchema = yup.object({
  doctorId: yup.string().trim().required('Doctor is required'),
  scheduledAt: yup
    .string()
    .required('Date & time required')
    .test('is-future', 'Choose a future time', (value) => {
      if (!value) return false;
      const picked = new Date(value);
      return picked.getTime() > now().getTime();
    }),
});

export type AppointmentBookingForm = yup.InferType<
  typeof appointmentBookingSchema
>;

export const treatmentSchema = yup.object({
  name: yup
    .string()
    .transform((value) => {
      // Trim and handle empty strings
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
      }
      return value;
    })
    .required('Treatment name required')
    .min(1, 'Treatment name required'),
  cost: yup
    .number()
    .typeError('Cost must be numeric')
    .positive('Cost must be positive')
    .required('Cost required')
    .transform((_value, originalValue) => {
      // Handle empty string or undefined
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return undefined;
      }
      const num = typeof originalValue === 'string' ? parseFloat(originalValue) : originalValue;
      return isNaN(num) ? undefined : num;
    }),
});

export type TreatmentFormValues = yup.InferType<typeof treatmentSchema>;

