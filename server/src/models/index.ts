import User from './user';
import Appointment from './appointment';
import Treatment from './treatment';
import FinanceReview from './financeReview';
import RefreshToken from './refreshToken';

Appointment.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });
User.hasMany(Appointment, { foreignKey: 'patient_id', as: 'patientAppointments' });
User.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'doctorAppointments' });

Treatment.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });
Appointment.hasMany(Treatment, { foreignKey: 'appointment_id', as: 'treatments' });

FinanceReview.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });
FinanceReview.belongsTo(User, { foreignKey: 'finance_user_id', as: 'financeUser' });
Appointment.hasMany(FinanceReview, { foreignKey: 'appointment_id', as: 'financeReviews' });
User.hasMany(FinanceReview, { foreignKey: 'finance_user_id', as: 'financeReviews' });

RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });

export { User, Appointment, Treatment, FinanceReview, RefreshToken };

