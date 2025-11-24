import { Response } from 'express';
import '../models'; // Ensure associations are loaded
import { AuthRequest } from '../middlewares/auth';
import { AppointmentService } from '../services/appointment.service';
import { successResponse, errorResponse } from '../utils/responses';
import logger from '../utils/logger';

const appointmentService = new AppointmentService();

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user!.id;
    const { doctor_id, scheduled_time } = req.body;

    const appointment = await appointmentService.createAppointment(
      patientId,
      doctor_id,
      new Date(scheduled_time)
    );

    return successResponse(
      res,
      appointment,
      'Appointment created successfully',
      201
    );
  } catch (error: any) {
    logger.error('Create appointment error:', error);
    if (error.message === 'Doctor not found') {
      return errorResponse(res, error.message, 404);
    }
    return errorResponse(res, 'Failed to create appointment', 500);
  }
};

export const getPatientAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.params.patientId;

    if (req.user!.role !== 'patient' && req.user!.id !== patientId) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    const appointments = await appointmentService.getPatientAppointments(patientId);
    return successResponse(res, appointments, 'Appointments retrieved successfully');
  } catch (error: any) {
    logger.error('Get patient appointments error:', error);
    return errorResponse(res, 'Failed to retrieve appointments', 500);
  }
};

export const getDoctorAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.params.doctorId;

    if (req.user!.role !== 'doctor' && req.user!.id !== doctorId) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    const appointments = await appointmentService.getDoctorAppointments(doctorId);
    return successResponse(res, appointments, 'Appointments retrieved successfully');
  } catch (error: any) {
    logger.error('Get doctor appointments error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Doctor ID:', req.params.doctorId);
    const errorMessage = error?.message || 'Failed to retrieve appointments';
    return errorResponse(res, errorMessage, 500);
  }
};

export const createAppointmentForDoctor = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.params.doctorId;
    
    // Verify the doctor ID matches the logged-in doctor
    if (req.user!.id !== doctorId) {
      return errorResponse(res, 'You can only create appointments for yourself', 403);
    }

    const { patient_id, scheduled_time } = req.body;

    const appointment = await appointmentService.createAppointment(
      patient_id,
      doctorId,
      new Date(scheduled_time)
    );

    return successResponse(
      res,
      appointment,
      'Appointment created successfully',
      201
    );
  } catch (error: any) {
    logger.error('Create appointment for doctor error:', error);
    if (error.message === 'Doctor not found') {
      return errorResponse(res, error.message, 404);
    }
    return errorResponse(res, 'Failed to create appointment', 500);
  }
};

export const startAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const appointmentId = req.params.id;
    const doctorId = req.user!.id;

    logger.info(`Starting appointment ${appointmentId} for doctor ${doctorId}`);

    const appointment = await appointmentService.startAppointment(
      appointmentId,
      doctorId
    );

    return successResponse(res, appointment, 'Appointment started successfully');
  } catch (error: any) {
    logger.error('Start appointment error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Error message:', error.message);
    
    if (error.message === 'Doctor already has an appointment in progress') {
      return errorResponse(res, error.message, 409);
    }
    if (
      error.message === 'Appointment not found' ||
      error.message === 'Unauthorized to start this appointment' ||
      error.message === 'Appointment must be scheduled to start'
    ) {
      return errorResponse(res, error.message, 400);
    }
    return errorResponse(res, error.message || 'Failed to start appointment', 500);
  }
};

export const finishAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const appointmentId = req.params.id;
    const doctorId = req.user!.id;

    const appointment = await appointmentService.finishAppointment(
      appointmentId,
      doctorId
    );

    return successResponse(res, appointment, 'Appointment finished successfully');
  } catch (error: any) {
    logger.error('Finish appointment error:', error);
    if (
      error.message === 'Appointment not found' ||
      error.message === 'Unauthorized to finish this appointment' ||
      error.message === 'Appointment must be in progress to finish'
    ) {
      return errorResponse(res, error.message, 400);
    }
    return errorResponse(res, 'Failed to finish appointment', 500);
  }
};

