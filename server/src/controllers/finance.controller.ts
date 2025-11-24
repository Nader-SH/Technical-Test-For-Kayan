import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Op } from 'sequelize';
import Appointment from '../models/appointment';
import User from '../models/user';
import Treatment from '../models/treatment';
import FinanceReview from '../models/financeReview';
import sequelize from '../config/db';
import { successResponse, errorResponse } from '../utils/responses';
import logger from '../utils/logger';

export const searchAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const {
      doctor,
      patient,
      appointmentId,
      status,
      from,
      to,
      limit = 20,
      page = 1,
    } = req.query;

    const where: any = {};
    const include: any[] = [
      {
        model: User,
        as: 'doctor',
        attributes: ['id', 'full_name', 'email'],
        ...(doctor && {
          where: {
            full_name: { [Op.iLike]: `%${doctor}%` },
          },
        }),
      },
      {
        model: User,
        as: 'patient',
        attributes: ['id', 'full_name', 'email'],
        ...(patient && {
          where: {
            full_name: { [Op.iLike]: `%${patient}%` },
          },
        }),
      },
      {
        model: Treatment,
        as: 'treatments',
      },
    ];

    if (appointmentId) {
      where.id = appointmentId;
    }

    if (status) {
      where.status = status;
    }

    if (from || to) {
      where.scheduled_time = {};
      if (from) {
        where.scheduled_time[Op.gte] = new Date(from as string);
      }
      if (to) {
        where.scheduled_time[Op.lte] = new Date(to as string);
      }
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      include,
      limit: Number(limit),
      offset,
      order: [['scheduled_time', 'DESC']],
    });

    return successResponse(res, {
      appointments: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    }, 'Appointments retrieved successfully');
  } catch (error: any) {
    logger.error('Search appointments error:', error);
    return errorResponse(res, 'Failed to search appointments', 500);
  }
};

export const reviewAppointment = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const appointmentId = req.params.id;
    const { approved, notes } = req.body;
    const financeUserId = req.user!.id;

    // Verify appointment exists
    const appointment = await Appointment.findByPk(appointmentId, { transaction });
    if (!appointment) {
      await transaction.rollback();
      return errorResponse(res, 'Appointment not found', 404);
    }

    // Check if review already exists
    const existingReview = await FinanceReview.findOne({
      where: { appointment_id: appointmentId },
      transaction,
    });

    let review;
    if (existingReview) {
      review = await existingReview.update(
        {
          finance_user_id: financeUserId,
          approved,
          notes,
        },
        { transaction }
      );
    } else {
      review = await FinanceReview.create(
        {
          appointment_id: appointmentId,
          finance_user_id: financeUserId,
          approved,
          notes,
        },
        { transaction }
      );
    }

    await transaction.commit();

    return successResponse(res, review, 'Appointment reviewed successfully');
  } catch (error: any) {
    await transaction.rollback();
    logger.error('Review appointment error:', error);
    return errorResponse(res, 'Failed to review appointment', 500);
  }
};

