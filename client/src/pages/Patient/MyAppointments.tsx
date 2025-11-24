import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { AppointmentCard } from '../../components/AppointmentCard';
import { usePatientAppointments } from '../../hooks/useAppointments';

export const PatientAppointmentsPage = () => {
  const { data, isLoading } = usePatientAppointments();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={180} />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return <Typography>No appointments yet.</Typography>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
};

