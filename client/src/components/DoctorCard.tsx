import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

interface DoctorCardProps {
  name: string;
  specialty?: string;
  onSelect?: () => void;
}

export const DoctorCard = ({ name, specialty, onSelect }: DoctorCardProps) => {
  return (
    <Card variant="outlined" className="border border-slate-200">
      <CardContent>
        <Typography variant="h6">{name}</Typography>
        {specialty && (
          <Typography variant="body2" color="text.secondary">
            {specialty}
          </Typography>
        )}
      </CardContent>
      {onSelect && (
        <CardActions>
          <Button size="small" onClick={onSelect}>
            Book with {name.split(' ')[0]}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

