import { useMemo, useState } from 'react';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';

import { DoctorCard } from '../../components/DoctorCard';
import { useDoctorDirectory } from '../../hooks/useDoctorDirectory';
import { ROUTES } from '../../utils/constants';

export const PatientDoctorsListPage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useDoctorDirectory();
  const [search, setSearch] = useState('');

  const filteredDoctors = useMemo(() => {
    if (!data) return [];
    return data.filter((doctor) =>
      doctor.full_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const handleSelect = (doctorId: string) => {
    navigate(`${ROUTES.patient.newAppointment}?doctorId=${doctorId}`);
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
        <TextField
          label="Search doctors"
          placeholder="Type a name..."
          fullWidth
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Button
          variant="outlined"
          onClick={() => navigate(ROUTES.patient.newAppointment)}
        >
          Book without selection
        </Button>
      </Stack>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={140} />
          ))}
        </div>
      )}

      {!isLoading && filteredDoctors.length === 0 && (
        <Alert severity="info">
          No doctors found. Ask your care team to onboard doctors so you can
          request new visits.
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {filteredDoctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            name={doctor.full_name}
            onSelect={() => handleSelect(doctor.id)}
          />
        ))}
      </div>
    </Stack>
  );
};

