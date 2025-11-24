import type { User } from '../types/api';

export const DEMO_DOCTORS: Array<Pick<User, 'id' | 'full_name'>> = [
  {
    id: 'doctor-uuid-1',
    full_name: 'Dr. John Smith',
  },
  {
    id: 'doctor-uuid-2',
    full_name: 'Dr. Sarah Connor',
  },
  {
    id: 'doctor-uuid-3',
    full_name: 'Dr. Ahmed Latif',
  },
];

