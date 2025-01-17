import { RequestHandler } from 'express';
import sessionsArray from '../../models/sessionsArray';
import { IMessage } from '../../interfaces/message';

export const sendMessage: RequestHandler = async (req, res) => {
  const { name } = req.params;
  const { text, attachment, to } = req.body;

  const whatsapp = sessionsArray.find(name);

  if (!whatsapp) {
    return res.status(404).json({ message: `WhatsApp ${name} was not found` });
  }

  const phoneNumber = await whatsapp.whatsAppPhoneNumber(to);

  if (!phoneNumber) {
    return res
      .status(404)
      .json({ message: `Phone number does not exist on WhatsApp` });
  }

  const message: IMessage = {
    text,
    attachment,
  };

  let sentMessage;

  if (message.attachment) {
    sentMessage = await whatsapp.sendAttachmentsMessage(phoneNumber, message);
  } else {
    sentMessage = await whatsapp.sendTextMessage(phoneNumber, message);
  }

  return res.status(200).json({ sentMessage });
};

export const editMessage: RequestHandler = async (req, res) => {
  const { name, id } = req.params;
  const { newText } = req.body;

  if (!name || !newText)
    return res
      .status(404)
      .json({ message: `"name" and "newText" params are required` });

  const whatsapp = sessionsArray.find(name);

  if (!whatsapp) {
    return res.status(404).json({ message: `WhatsApp ${name} was not found` });
  }

  const editedMessage = await whatsapp.editMessage(id, newText);

  if (!editedMessage)
    return res.status(400).json({ message: `Error reacting message: ${id}` });

  return res.status(200).json({ message: `${id} was edited.` });
};

export const reactMessage: RequestHandler = async (req, res) => {
  const { name, id } = req.params;
  const { reaction } = req.body;

  if (!name)
    return res.status(404).json({ message: `"name" params is required` });

  const whatsapp = sessionsArray.find(name);

  if (!whatsapp) {
    return res.status(404).json({ message: `WhatsApp ${name} was not found` });
  }

  const reactedMessage = await whatsapp.reactMessage(id, reaction);

  if (!reactedMessage)
    return res.status(400).json({ message: `Error reacting message: ${id}` });

  return res
    .status(200)
    .json({ message: `${id} was reacted with ${reaction}.` });
};

export const deleteMessage: RequestHandler = async (req, res) => {
  const { name, id } = req.params;

  if (!name || !id)
    return res
      .status(404)
      .json({ message: `"name" and "id" params are required` });

  const whatsapp = sessionsArray.find(name);

  if (!whatsapp) {
    return res.status(404).json({ message: `WhatsApp ${name} was not found` });
  }

  const deletedMessage = await whatsapp.deleteMessage(id);

  if (!deletedMessage)
    return res.status(400).json({ message: `Error deleting message: ${id}` });

  return res.status(200).json({ message: `${id} was deleted.` });
};
