import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import {
  treatmentSchema,
  type TreatmentFormValues,
} from '../schemas/appointment.schema';

interface Props {
  onSubmit: (values: TreatmentFormValues) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export const TreatmentForm = ({
  onSubmit,
  isSubmitting,
  disabled = false,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TreatmentFormValues>({
    resolver: yupResolver(treatmentSchema),
    defaultValues: {
      name: '',
      cost: undefined as unknown as number,
    },
    mode: 'onBlur', // Only validate on blur, not on change
  });

  // No need for useEffect - we reset immediately in submit function

  const submit = (values: TreatmentFormValues) => {
    // Ensure cost is a number
    const payload = {
      ...values,
      cost: typeof values.cost === 'string' ? parseFloat(values.cost) : values.cost,
    };
    
    // Call onSubmit
    onSubmit(payload);
    
    // Immediately clear the form fields (but keep form state for useEffect to handle)
    // This provides immediate visual feedback
    reset(
      {
        name: '',
        cost: undefined as unknown as number,
      },
      {
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="Treatment name"
          {...register('name')}
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          fullWidth
          disabled={disabled}
          key={`name-${isSubmitting ? 'submitting' : 'idle'}`}
        />
        <TextField
          type="number"
          label="Cost"
          {...register('cost', { 
            valueAsNumber: true,
            setValueAs: (value) => {
              if (value === '' || value === null || value === undefined) {
                return undefined;
              }
              const num = typeof value === 'string' ? parseFloat(value) : value;
              return isNaN(num) ? undefined : num;
            },
          })}
          error={Boolean(errors.cost)}
          helperText={errors.cost?.message}
          fullWidth
          inputProps={{ min: 0, step: 0.01 }}
          disabled={disabled}
          key={isSubmitting ? 'submitting' : 'idle'} // Force re-render to clear value
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || disabled}
          sx={{ minWidth: 140 }}
        >
          Add
        </Button>
      </Stack>
    </form>
  );
};

