import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../schemas/auth.schema';
import type { LoginFormValues } from '../schemas/auth.schema';
import { ROLE_DEFAULT_ROUTE } from '../utils/constants';

export const LoginPage = () => {
  const { login, isAuthenticated, role } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (isAuthenticated && role) {
    return <Navigate to={ROLE_DEFAULT_ROUTE[role]} replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    await login(values);
  };

  return (
    <Box className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card sx={{ maxWidth: 420, width: '100%', boxShadow: 6 }}>
        <CardHeader
          title="Welcome back"
          subheader="Sign in to manage appointments"
        />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              label="Email"
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
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
            >
              Sign in
            </Button>
          </form>

          <Stack direction="row" justifyContent="center" spacing={1} mt={3}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?
            </Typography>
            <Typography
              component={RouterLink}
              to="/signup"
              variant="body2"
              color="primary"
              sx={{ textDecoration: 'none' }}
            >
              Sign up
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

