/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from 'express';
import { WhatsApp } from '../../models/whatsapp';
import sessionsArray from '../../models/sessionsArray';
import { generateAccessToken } from '../../middleware/jwt';

export const start: RequestHandler = (req, res) => {
  try {
    const { name } = req.params;
    new WhatsApp(name);
    return res.status(200).json({ token: generateAccessToken(name) });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const close: RequestHandler = async (req, res) => {
  try {
    const { name } = req.params;
    sessionsArray.pop(name)?.close();
    return res.status(200).json({ message: 'WhatsApp is now closed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
