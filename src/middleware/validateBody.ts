import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { title } from 'process';

export const sendNotificationSchema = Joi.object({
  token: Joi.string().required(),
  title: Joi.string().max(200).required(),
  body: Joi.string().max(1000).required(),
  data: Joi.object().optional(),
});

export function validateSendNotification(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = sendNotificationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
  next();
}
