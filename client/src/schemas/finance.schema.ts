import * as yup from 'yup';

export interface FinanceSearchValues {
  doctor?: string;
  patient?: string;
  appointmentId?: string;
  from?: string;
  to?: string;
}

export const financeSearchSchema: yup.ObjectSchema<FinanceSearchValues> = yup
  .object({
    doctor: yup.string().trim().optional(),
    patient: yup.string().trim().optional(),
    appointmentId: yup.string().trim().optional(),
    from: yup.string().optional(),
    to: yup.string().optional(),
  })
  .defined();

export interface FinanceReviewFormValues {
  approved: boolean;
  notes?: string;
}

export const financeReviewSchema: yup.ObjectSchema<FinanceReviewFormValues> = yup
  .object({
    approved: yup.boolean().required(),
    notes: yup.string().max(500).optional(),
  })
  .defined();

