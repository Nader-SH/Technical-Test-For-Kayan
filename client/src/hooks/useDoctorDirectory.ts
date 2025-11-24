import { useQuery } from '@tanstack/react-query';

import { fetchDoctors } from '../api/users';
import type { User } from '../types/api';
import { useAuth } from './useAuth';

export const useDoctorDirectory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['doctors'],
    enabled: Boolean(user),
    queryFn: async () => {
      const doctors = await fetchDoctors();
      // Return only id and full_name for compatibility
      return doctors.map((doctor) => ({
        id: doctor.id,
        full_name: doctor.full_name,
      }));
    },
  });
};

