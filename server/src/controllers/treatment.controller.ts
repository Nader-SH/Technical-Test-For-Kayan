import { Response } from 'express';
import '../models';
import { AuthRequest } from '../middlewares/auth';
import { AppointmentService } from '../services/appointment.service';
import Treatment from '../models/treatment';
import Appointment from '../models/appointment';
import User from '../models/user';
import sequelize from '../config/db';
import { successResponse, errorResponse } from '../utils/responses';
import logger from '../utils/logger';

const appointmentService = new AppointmentService();

export const createTreatment = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const appointmentId = req.params.id;
    const { name, cost } = req.body;

    const costNumber = typeof cost === 'string' ? parseFloat(cost) : cost;
    if (isNaN(costNumber) || costNumber <= 0) {
      await transaction.rollback();
      return errorResponse(res, 'Cost must be a positive number', 400);
    }

    const appointment = await Appointment.findByPk(appointmentId, { 
      transaction,
      include: [
        { model: User, as: 'doctor', attributes: ['id', 'full_name', 'email'], required: false },
      ],
    });
    if (!appointment) {
      await transaction.rollback();
      return errorResponse(res, 'Appointment not found', 404);
    }

    if (appointment.doctor_id !== req.user!.id) {
      await transaction.rollback();
      return errorResponse(res, 'Unauthorized', 403);
    }

    if (appointment.status !== 'in_progress') {
      await transaction.rollback();
      return errorResponse(res, 'Appointment must be in progress to add treatments', 400);
    }

    const treatment = await Treatment.create(
      {
        appointment_id: appointmentId,
        name: name.trim(),
        cost: costNumber,
      },
      { transaction }
    );

    await appointmentService.recalculateTotalAmount(appointmentId, transaction);

    await appointment.reload({
      transaction,
      include: [
        { model: User, as: 'doctor', attributes: ['id', 'full_name', 'email'], required: false },
      ],
    });

    await transaction.commit();

    return successResponse(
      res, 
      { ...treatment.toJSON(), doctor_id: appointment.doctor_id },
      'Treatment added successfully', 
      201
    );
  } catch (error: any) {
    await transaction.rollback();
    logger.error('Create treatment error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Request body:', req.body);
    const errorMessage = error?.message || 'Failed to add treatment';
    return errorResponse(res, errorMessage, 500);
  }
};

export const deleteTreatment = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { id: appointmentId, treatmentId } = req.params;

    const appointment = await Appointment.findByPk(appointmentId, { transaction });
    if (!appointment) {
      await transaction.rollback();
      return errorResponse(res, 'Appointment not found', 404);
    }

    if (appointment.doctor_id !== req.user!.id) {
      await transaction.rollback();
      return errorResponse(res, 'Unauthorized', 403);
    }

    const treatment = await Treatment.findOne({
      where: {
        id: treatmentId,
        appointment_id: appointmentId,
      },
      transaction,
    });

    if (!treatment) {
      await transaction.rollback();
      return errorResponse(res, 'Treatment not found', 404);
    }

    await treatment.destroy({ transaction });

    await appointmentService.recalculateTotalAmount(appointmentId, transaction);

    await appointment.reload({
      transaction,
      include: [
        { model: User, as: 'doctor', attributes: ['id', 'full_name', 'email'], required: false },
      ],
    });

    await transaction.commit();

    return successResponse(
      res,
      { doctor_id: appointment.doctor_id },
      'Treatment deleted successfully'
    );
  } catch (error: any) {
    await transaction.rollback();
    logger.error('Delete treatment error:', error);
    return errorResponse(res, 'Failed to delete treatment', 500);
  }
};

