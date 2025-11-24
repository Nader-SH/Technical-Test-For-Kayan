import { useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router-dom';

import { AppointmentCard } from '../../components/AppointmentCard';
import { TreatmentForm } from '../../components/TreatmentForm';
import {
  findAppointmentById,
  useAppointmentActions,
  useDoctorAppointments,
} from '../../hooks/useAppointments';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDateTime } from '../../utils/date';

export const DoctorAppointmentViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useDoctorAppointments();
  const { startAppointment, finishAppointment, addTreatment, deleteTreatment } =
    useAppointmentActions();

  const appointment = useMemo(
    () => findAppointmentById(data, id),
    [data, id]
  );

  const hasOtherInProgress = useMemo(
    () =>
      data?.some(
        (item) => item.status === 'in_progress' && item.id !== appointment?.id
      ),
    [data, appointment?.id]
  );

  if (isLoading) {
    return <Skeleton variant="rounded" height={200} />;
  }

  if (!appointment) {
    return <Alert severity="warning">Appointment not found.</Alert>;
  }

  const canStart = appointment.status === 'scheduled' && !hasOtherInProgress;
  const canFinish = appointment.status === 'in_progress';

  const canAddTreatment = appointment.status === 'in_progress';

  return (
    <Stack spacing={3}>
      <AppointmentCard appointment={appointment} />

      <Stack direction="row" gap={2}>
        <Button
          variant="contained"
          disabled={!canStart || startAppointment.isPending}
          onClick={() => startAppointment.mutate(appointment.id)}
        >
          Start visit
        </Button>
        <Button
          variant="outlined"
          disabled={!canFinish || finishAppointment.isPending}
          onClick={() => finishAppointment.mutate(appointment.id)}
        >
          Finish visit
        </Button>
      </Stack>

      {hasOtherInProgress && (
        <Alert severity="info">
          You already have another visit in progress. Finish it before starting
          a new one.
        </Alert>
      )}

      <Divider />

      <Box>
        <Typography variant="h6" gutterBottom>
          Treatments
        </Typography>
        <TreatmentForm
          onSubmit={(values) =>
            addTreatment.mutate({
              appointmentId: appointment.id,
              payload: values,
            })
          }
          isSubmitting={addTreatment.isPending}
          disabled={!canAddTreatment}
        />
        {!canAddTreatment && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            Start the visit to record treatments.
          </Typography>
        )}

        <List dense>
          {appointment.treatments?.map((treatment) => (
            <ListItem
              key={treatment.id}
              secondaryAction={
                canAddTreatment && (
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() =>
                      deleteTreatment.mutate({
                        appointmentId: appointment.id,
                        treatmentId: treatment.id,
                      })
                    }
                    disabled={deleteTreatment.isPending}
                  >
                    <DeleteIcon />
                  </IconButton>
                )
              }
            >
              <ListItemText
                primary={`${treatment.name} · $${Number(
                  treatment.cost
                ).toFixed(2)}`}
                secondary={`Added ${formatDateTime(treatment.created_at)}`}
              />
            </ListItem>
          ))}
        </List>
        {!appointment.treatments?.length && (
          <Typography color="text.secondary">
            No treatments recorded yet.
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

