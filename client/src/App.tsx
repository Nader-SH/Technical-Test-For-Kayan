import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { Header } from './components/Header';
import { PrivateRoute } from './components/PrivateRoute';
import { ProtectedRouteByRole } from './components/ProtectedRouteByRole';
import { LoginPage } from './pages/Login';
import { SignupPage } from './pages/Signup';
import { PatientDoctorsListPage } from './pages/Patient/DoctorsList';
import { PatientNewAppointmentPage } from './pages/Patient/NewAppointment';
import { PatientAppointmentsPage } from './pages/Patient/MyAppointments';
import { DoctorAppointmentsListPage } from './pages/Doctor/AppointmentsList';
import { DoctorAppointmentViewPage } from './pages/Doctor/AppointmentView';
import { FinanceSearchPage } from './pages/Finance/Search';
import { ProfilePage } from './pages/Profile';
import { ROUTES } from './utils/constants';

const AppLayout = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Header />
    <Box mt={4}>
      <Outlet />
    </Box>
  </Container>
);

function App() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route
            index
            element={<Navigate to={ROUTES.patient.doctors} replace />}
          />

          <Route element={<ProtectedRouteByRole allow={['patient']} />}>
            <Route path={ROUTES.patient.doctors} element={<PatientDoctorsListPage />} />
            <Route
              path={ROUTES.patient.newAppointment}
              element={<PatientNewAppointmentPage />}
            />
            <Route
              path={ROUTES.patient.myAppointments}
              element={<PatientAppointmentsPage />}
            />
          </Route>

          <Route element={<ProtectedRouteByRole allow={['doctor']} />}>
            <Route
              path={ROUTES.doctor.list}
              element={<DoctorAppointmentsListPage />}
            />
            <Route
              path={ROUTES.doctor.detail()}
              element={<DoctorAppointmentViewPage />}
            />
          </Route>

          <Route element={<ProtectedRouteByRole allow={['finance']} />}>
            <Route path={ROUTES.finance.search} element={<FinanceSearchPage />} />
          </Route>

          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
    </Routes>
  );
}

export default App;
