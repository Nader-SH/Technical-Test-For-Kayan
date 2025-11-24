import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

import { AppointmentCard } from '../../components/AppointmentCard';
import { useDoctorAppointments } from '../../hooks/useAppointments';
import { ROUTES } from '../../utils/constants';

export const DoctorAppointmentsListPage = () => {
  const { data, isLoading } = useDoctorAppointments();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={160} />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return <Typography>No assigned appointments.</Typography>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          footer={
            <Stack direction="row" justifyContent="flex-end">
              <Button
                size="small"
                component={RouterLink}
                to={ROUTES.doctor.detail(appointment.id)}
              >
                Manage visit
              </Button>
            </Stack>
          }
        />
      ))}
    </div>
  );
};

