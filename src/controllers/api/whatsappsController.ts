import { RequestHandler } from 'express';
import { WhatsApp } from '../../models/whatsapp';
import sessionsArray from '../../models/sessionsArray';

export const start: RequestHandler = (req, res) => {
  const { name } = req.params;
  const zap = new WhatsApp(name);
  sessionsArray.push(zap);
  return res.status(200).json({ message: 'WhatsApp has started' });
};

export const close: RequestHandler = async (req, res) => {
  const { name } = req.params;
  sessionsArray.pop(name)?.close();
  return res.status(200).json({ message: 'WhatsApp is now closed' });
};
