import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface Props {
  label: string;
  value: string | number;
  helper?: string;
}

export const DashboardCard = ({ label, value, helper }: Props) => (
  <Card variant="outlined" className="border border-slate-200">
    <CardContent>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4">{value}</Typography>
      {helper && (
        <Typography variant="body2" color="text.secondary">
          {helper}
        </Typography>
      )}
    </CardContent>
  </Card>
);

