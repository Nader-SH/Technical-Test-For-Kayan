import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';

const navConfig = {
  patient: [
    { label: 'Doctors', to: ROUTES.patient.doctors },
    { label: 'Book', to: ROUTES.patient.newAppointment },
    { label: 'My Appointments', to: ROUTES.patient.myAppointments },
  ],
  doctor: [
    { label: 'Appointments', to: ROUTES.doctor.list },
  ],
  finance: [{ label: 'Search', to: ROUTES.finance.search }],
};

export const Header = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = navConfig[user.role] ?? [];

  return (
    <AppBar position="sticky" color="transparent" elevation={0}>
      <Toolbar className="flex gap-4">
        <div className="flex-1">
          <Typography variant="h6" color="text.primary">
            {import.meta.env.VITE_APP_NAME || 'Healthcare Portal'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.full_name} · {user.role}
          </Typography>
        </div>
        <Stack direction="row" spacing={1} className="flex-wrap">
          {navItems.map((item) => (
            <Button
              key={item.to}
              component={NavLink}
              to={item.to}
              color="primary"
              variant="text"
            >
              {item.label}
            </Button>
          ))}
          <Button
            component={NavLink}
            to="/profile"
            color="primary"
            variant="text"
          >
            Profile
          </Button>
          <Button variant="outlined" onClick={() => logout()}>
            Logout
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

