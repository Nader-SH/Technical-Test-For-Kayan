import { Op, Transaction } from 'sequelize';
import sequelize from '../config/db';
import Appointment, { AppointmentStatus } from '../models/appointment';
import User from '../models/user';
import Treatment from '../models/treatment';
import { errorResponse } from '../utils/responses';

export class AppointmentService {
  async createAppointment(
    patientId: string,
    doctorId: string,
    scheduledTime: Date
  ): Promise<Appointment> {
    // Verify doctor exists and is a doctor
    const doctor = await User.findOne({
      where: { id: doctorId, role: 'doctor' },
    });

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    const appointment = await Appointment.create({
      patient_id: patientId,
      doctor_id: doctorId,
      scheduled_time: scheduledTime,
      status: AppointmentStatus.SCHEDULED,
    });

    return appointment;
  }

  async startAppointment(
    appointmentId: string,
    doctorId: string
  ): Promise<Appointment> {
    return await sequelize.transaction(async (transaction) => {
      // Lock and check if doctor has any in_progress appointment
      const existingInProgress = await Appointment.findOne({
        where: {
          doctor_id: doctorId,
          status: AppointmentStatus.IN_PROGRESS,
        },
        lock: Transaction.LOCK.UPDATE,
        transaction,
      });

      if (existingInProgress) {
        throw new Error('Doctor already has an appointment in progress');
      }

      // Lock the appointment we're trying to start
      const appointment = await Appointment.findByPk(appointmentId, {
        lock: Transaction.LOCK.UPDATE,
        transaction,
        include: [
          { model: User, as: 'patient' },
          { model: User, as: 'doctor' },
        ],
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.doctor_id !== doctorId) {
        throw new Error('Unauthorized to start this appointment');
      }

      if (appointment.status !== AppointmentStatus.SCHEDULED) {
        throw new Error('Appointment must be scheduled to start');
      }

      appointment.status = AppointmentStatus.IN_PROGRESS;
      appointment.started_at = new Date();
      await appointment.save({ transaction });

      return appointment;
    });
  }

  async finishAppointment(
    appointmentId: string,
    doctorId: string
  ): Promise<Appointment> {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: User, as: 'patient' },
        { model: User, as: 'doctor' },
        { model: Treatment, as: 'treatments' },
      ],
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.doctor_id !== doctorId) {
      throw new Error('Unauthorized to finish this appointment');
    }

    if (appointment.status !== AppointmentStatus.IN_PROGRESS) {
      throw new Error('Appointment must be in progress to finish');
    }

    appointment.status = AppointmentStatus.COMPLETED;
    appointment.finished_at = new Date();
    await appointment.save();

    return appointment;
  }

  async getPatientAppointments(patientId: string) {
    return await Appointment.findAll({
      where: { patient_id: patientId },
      include: [
        { model: User, as: 'doctor', attributes: ['id', 'full_name', 'email'] },
        { model: Treatment, as: 'treatments' },
      ],
      order: [['scheduled_time', 'DESC']],
    });
  }

  async getDoctorAppointments(doctorId: string) {
    return await Appointment.findAll({
      where: { doctor_id: doctorId },
      include: [
        { model: User, as: 'patient', attributes: ['id', 'full_name', 'email'] },
        { model: Treatment, as: 'treatments' },
      ],
      order: [['scheduled_time', 'DESC']],
    });
  }

  async recalculateTotalAmount(appointmentId: string, transaction?: Transaction) {
    const treatments = await Treatment.findAll({
      where: { appointment_id: appointmentId },
      transaction,
    });

    const totalAmount = treatments.reduce(
      (sum, treatment) => sum + parseFloat(treatment.cost.toString()),
      0
    );

    await Appointment.update(
      { total_amount: totalAmount },
      {
        where: { id: appointmentId },
        transaction,
      }
    );

    return totalAmount;
  }
}

