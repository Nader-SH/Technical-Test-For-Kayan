export const STORAGE_KEYS = {
  REFRESH_TOKEN: 'kayan_refresh_token',
  LAST_USER: 'kayan_last_user',
};

export const ROUTES = {
  login: '/login',
  patient: {
    doctors: '/patient/doctors',
    newAppointment: '/patient/appointments/new',
    myAppointments: '/patient/appointments',
  },
  doctor: {
    list: '/doctor/appointments',
    detail: (id: string = ':id') => `/doctor/appointment/${id}`,
  },
  finance: {
    search: '/finance/search',
  },
};

export const ROLE_DEFAULT_ROUTE: Record<string, string> = {
  patient: ROUTES.patient.doctors,
  doctor: ROUTES.doctor.list,
  finance: ROUTES.finance.search,
};

