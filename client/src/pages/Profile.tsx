import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fetchProfile } from '../api/users';
import { useAuth } from '../hooks/useAuth';
import { formatDateTime } from '../utils/date';

export const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: Boolean(authUser),
  });

  if (isLoading) {
    return <Skeleton variant="rounded" height={300} />;
  }

  const displayUser = profile || authUser;

  if (!displayUser) {
    return (
      <Box>
        <Typography variant="h6">Profile not found</Typography>
      </Box>
    );
  }

  const roleColors: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
    patient: 'primary',
    doctor: 'success',
    finance: 'warning',
  };

  return (
    <Card>
      <CardHeader title="Profile" />
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Full Name
            </Typography>
            <Typography variant="h6">{displayUser.full_name}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{displayUser.email}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Role
            </Typography>
            <Chip
              label={displayUser.role}
              color={roleColors[displayUser.role] || 'default'}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>

          {profile?.created_at && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body2">
                {formatDateTime(profile.created_at)}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

