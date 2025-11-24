import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { Appointment } from '../types/api';
import { formatDateTime } from '../utils/date';

interface Props {
  appointment: Appointment;
  footer?: React.ReactNode;
}

const statusColor: Record<string, 'default' | 'primary' | 'success' | 'warning'> =
  {
    scheduled: 'default',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'default',
  };

export const AppointmentCard = ({ appointment, footer }: Props) => {
  const doctorName = appointment.doctor?.full_name ?? 'Doctor';
  const patientName = appointment.patient?.full_name ?? 'Patient';

  return (
    <Card variant="outlined" className="border border-slate-200">
      <CardContent className="space-y-2">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            {doctorName} · {patientName}
          </Typography>
          <Chip
            label={appointment.status.replace('_', ' ')}
            color={statusColor[appointment.status] || 'default'}
            size="small"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Scheduled: {formatDateTime(appointment.scheduled_time)}
        </Typography>
        {appointment.started_at && (
          <Typography variant="body2" color="text.secondary">
            Started: {formatDateTime(appointment.started_at)}
          </Typography>
        )}
        {appointment.finished_at && (
          <Typography variant="body2" color="text.secondary">
            Finished: {formatDateTime(appointment.finished_at)}
          </Typography>
        )}

        <Divider />
        <Typography variant="subtitle2">
          Total: $
          {Number(appointment.total_amount ?? 0).toFixed(2)}
        </Typography>
        {footer}
      </CardContent>
    </Card>
  );
};

