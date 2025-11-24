import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

import { searchFinanceAppointments, reviewFinanceAppointment } from '../../api/finance';
import type { Appointment, FinanceSearchFilters } from '../../types/api';
import {
  financeReviewSchema,
  financeSearchSchema,
} from '../../schemas/finance.schema';
import type {
  FinanceReviewFormValues,
  FinanceSearchValues,
} from '../../schemas/finance.schema';
import { formatDateTime } from '../../utils/date';
import toast from 'react-hot-toast';

export const FinanceSearchPage = () => {
  const [filters, setFilters] = useState<FinanceSearchFilters>({
    limit: 10,
    page: 1,
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const searchForm = useForm<FinanceSearchValues>({
    resolver: yupResolver(financeSearchSchema),
    defaultValues: {
      doctor: '',
      patient: '',
      appointmentId: '',
      from: '',
      to: '',
    },
  });

  const reviewForm = useForm<FinanceReviewFormValues>({
    resolver: yupResolver(financeReviewSchema),
    defaultValues: {
      approved: true,
      notes: '',
    },
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['finance-search', filters],
    queryFn: () => searchFinanceAppointments(filters),
  });

  const reviewMutation = useMutation({
    mutationFn: (values: FinanceReviewFormValues) =>
      reviewFinanceAppointment(selectedAppointment!.id, values),
    onSuccess: () => {
      toast.success('Review stored');
      reviewForm.reset();
      setSelectedAppointment(null);
      queryClient.invalidateQueries({ queryKey: ['finance-search'] });
    },
    onError: () => {
      toast.error('Failed to store review');
    },
  });

  const appointments: Appointment[] = data?.appointments ?? [];
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formValues = searchForm.watch(['doctor', 'patient', 'appointmentId', 'from', 'to']);

  // Auto-search when form values change
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the search to avoid too many requests
    debounceTimerRef.current = setTimeout(() => {
      const values = searchForm.getValues();
      
      // Clean up empty strings - convert to undefined
      const cleanedValues: FinanceSearchFilters = {
        limit: 10,
        page: 1,
      };

      if (values.doctor?.trim()) {
        cleanedValues.doctor = values.doctor.trim();
      }
      if (values.patient?.trim()) {
        cleanedValues.patient = values.patient.trim();
      }
      if (values.appointmentId?.trim()) {
        cleanedValues.appointmentId = values.appointmentId.trim();
      }
      if (values.from?.trim()) {
        cleanedValues.from = values.from.trim();
      }
      if (values.to?.trim()) {
        cleanedValues.to = values.to.trim();
      }

      setFilters(cleanedValues);
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues]);

  const handleSearch = searchForm.handleSubmit((values) => {
    // Clean up empty strings
    const cleanedValues: FinanceSearchFilters = {
      limit: 10,
      page: 1,
    };

    if (values.doctor?.trim()) {
      cleanedValues.doctor = values.doctor.trim();
    }
    if (values.patient?.trim()) {
      cleanedValues.patient = values.patient.trim();
    }
    if (values.appointmentId?.trim()) {
      cleanedValues.appointmentId = values.appointmentId.trim();
    }
    if (values.from?.trim()) {
      cleanedValues.from = values.from.trim();
    }
    if (values.to?.trim()) {
      cleanedValues.to = values.to.trim();
    }

    setFilters(cleanedValues);
  });

  const handlePageChange = (_: unknown, page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const openReview = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    const existingReview = appointment.financeReviews?.[0];
    reviewForm.reset({
      approved: existingReview?.approved ?? true,
      notes: existingReview?.notes ?? '',
    });
  };

  return (
    <Stack spacing={3}>
      <form onSubmit={handleSearch}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Doctor" {...searchForm.register('doctor')} fullWidth />
          <TextField label="Patient" {...searchForm.register('patient')} fullWidth />
          <TextField label="Appointment ID" {...searchForm.register('appointmentId')} fullWidth />
          <TextField
            fullWidth
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            {...searchForm.register('from')}
          />
          <TextField
            fullWidth
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            {...searchForm.register('to')}
          />
          <Button 
            fullWidth
            type="submit" 
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            Search
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              searchForm.reset({
                doctor: '',
                patient: '',
                appointmentId: '',
                from: '',
                to: '',
              });
              setFilters({
                limit: 10,
                page: 1,
              });
            }}
          >
            Clear
          </Button>
        </Stack>
      </form>

      <Box>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Results: {data?.pagination.total ?? 0}
        </Typography>
        <Table size="small">
            <TableHead>
            <TableRow>
              <TableCell>Appointment</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Review</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8}>Loading...</TableCell>
              </TableRow>
            )}
            {!isLoading && appointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>No appointments found.</TableCell>
              </TableRow>
            )}
            {!isLoading &&
              appointments.map((appointment) => {
                const review = appointment.financeReviews?.[0];
                return (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.id}</TableCell>
                    <TableCell>{appointment.doctor?.full_name}</TableCell>
                    <TableCell>{appointment.patient?.full_name}</TableCell>
                    <TableCell>{formatDateTime(appointment.scheduled_time)}</TableCell>
                    <TableCell>
                      ${Number(appointment.total_amount ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{appointment.status}</TableCell>
                    <TableCell>
                      {review ? (
                        <Box>
                          <Typography
                            variant="body2"
                            color={review.approved ? 'success.main' : 'warning.main'}
                          >
                            {review.approved ? '✓ Approved' : '⚠ Needs Review'}
                          </Typography>
                          {review.notes && (
                            <Typography variant="caption" color="text.secondary">
                              {review.notes}
                            </Typography>
                          )}
                          {review.financeUser && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              by {review.financeUser.full_name}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not reviewed
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => openReview(appointment)}>
                        {review ? 'Update Review' : 'Review'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <Pagination
            count={data?.pagination.totalPages ?? 1}
            page={data?.pagination.page ?? 1}
            onChange={handlePageChange}
          />
        </Stack>
      </Box>

      <Dialog
        open={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointment(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Finance review</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" mb={2}>
            {selectedAppointment?.doctor?.full_name} ·{' '}
            {selectedAppointment?.patient?.full_name}
          </Typography>
          <Stack spacing={2}>
          <Controller
            control={reviewForm.control}
            name="approved"
            render={({ field }) => (
              <TextField
                select
                label="Decision"
                value={field.value ? 'approved' : 'needs-review'}
                onChange={(event) =>
                  field.onChange(event.target.value === 'approved')
                }
              >
                <MenuItem value="approved">Approve</MenuItem>
                <MenuItem value="needs-review">Needs follow-up</MenuItem>
              </TextField>
            )}
          />
            <TextField
              label="Notes"
              multiline
              minRows={3}
              {...reviewForm.register('notes')}
              error={Boolean(reviewForm.formState.errors.notes)}
              helperText={reviewForm.formState.errors.notes?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAppointment(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={reviewForm.handleSubmit((values) =>
              reviewMutation.mutate(values)
            )}
            disabled={reviewMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

