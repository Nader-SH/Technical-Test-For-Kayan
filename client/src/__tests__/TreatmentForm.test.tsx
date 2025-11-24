import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { TreatmentForm } from '../components/TreatmentForm';

describe('TreatmentForm', () => {
  it('submits valid data', async () => {
    const onSubmit = vi.fn();
    render(<TreatmentForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/treatment name/i), {
      target: { value: 'X-Ray' },
    });
    fireEvent.change(screen.getByLabelText(/cost/i), {
      target: { value: '150' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ name: 'X-Ray', cost: 150 })
    );
  });
});

