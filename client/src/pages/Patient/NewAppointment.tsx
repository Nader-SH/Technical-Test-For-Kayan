import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import { useAppointmentActions } from '../../hooks/useAppointments';
import { useDoctorDirectory } from '../../hooks/useDoctorDirectory';
import {
  appointmentBookingSchema,
  type AppointmentBookingForm,
} from '../../schemas/appointment.schema';
import { toIsoStringLocal } from '../../utils/date';

export const PatientNewAppointmentPage = () => {
  const { createAppointment } = useAppointmentActions();
  const { data: doctors, isLoading } = useDoctorDirectory();
  const [params] = useSearchParams();

  const defaultDoctor = params.get('doctorId') ?? '';

  const [defaultDate] = useState(() =>
    toIsoStringLocal(new Date(Date.now() + 60 * 60 * 1000 * 24))
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AppointmentBookingForm>({
    resolver: yupResolver(appointmentBookingSchema),
    defaultValues: {
      doctorId: defaultDoctor,
      scheduledAt: defaultDate,
    },
  });

  const doctorOptions = useMemo(
    () =>
      doctors?.map((doctor) => ({
        label: doctor.full_name,
        value: doctor.id,
      })) ?? [],
    [doctors]
  );

  const onSubmit = async (values: AppointmentBookingForm) => {
    await createAppointment.mutateAsync({
      doctorId: values.doctorId,
      datetime: new Date(values.scheduledAt).toISOString(),
    });
  };

  return (
    <Box className="max-w-2xl space-y-4">
      <Typography variant="h5">Book appointment</Typography>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <TextField
          select
          label="Doctor"
          fullWidth
          disabled={isLoading || doctorOptions.length === 0}
          defaultValue={defaultDoctor}
          {...register('doctorId')}
          error={Boolean(errors.doctorId)}
          helperText={
            errors.doctorId?.message ||
            (!doctorOptions.length &&
              'No doctors available yet – ask your admin to onboard doctors.')
          }
        >
          {doctorOptions.map((doctor) => (
            <MenuItem key={doctor.value} value={doctor.value}>
              {doctor.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Date & time"
          type="datetime-local"
          fullWidth
          {...register('scheduledAt')}
          error={Boolean(errors.scheduledAt)}
          helperText={errors.scheduledAt?.message}
        />

        <Stack direction="row" justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            disabled={createAppointment.isPending}
          >
            Schedule
          </Button>
        </Stack>
      </form>

      <Alert severity="info">
        Booking assumes the doctor exists in the backend database. If you just
        spun up the backend, run the provided seed or signup scripts to create
        doctor accounts first.
      </Alert>
    </Box>
  );
};

