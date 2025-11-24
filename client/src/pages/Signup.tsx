import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { signupSchema } from '../schemas/auth.schema';
import type { SignupFormValues } from '../schemas/auth.schema';
import { ROUTES, ROLE_DEFAULT_ROUTE } from '../utils/constants';

export const SignupPage = () => {
  const { signup, isAuthenticated, role } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      role: 'patient',
    },
  });

  if (isAuthenticated && role) {
    return <Navigate to={ROLE_DEFAULT_ROUTE[role]} replace />;
  }

  const onSubmit = async (values: SignupFormValues) => {
    await signup(values);
  };

  return (
    <Box className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card sx={{ maxWidth: 420, width: '100%', boxShadow: 6 }}>
        <CardHeader
          title="Create account"
          subheader="Sign up to get started"
        />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              label="Full Name"
              fullWidth
              {...register('full_name')}
              error={Boolean(errors.full_name)}
              helperText={errors.full_name?.message}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              {...register('email')}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              {...register('password')}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />
            <TextField
              select
              label="Role"
              fullWidth
              defaultValue="patient"
              {...register('role')}
              error={Boolean(errors.role)}
              helperText={errors.role?.message}
            >
              <MenuItem value="patient">Patient</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="finance">Finance</MenuItem>
            </TextField>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
            >
              Sign up
            </Button>
          </form>

          <Stack direction="row" justifyContent="center" spacing={1} mt={3}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
            <Typography
              component={RouterLink}
              to={ROUTES.login}
              variant="body2"
              color="primary"
              sx={{ textDecoration: 'none' }}
            >
              Sign in
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

