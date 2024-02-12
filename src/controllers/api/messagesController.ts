import { RequestHandler } from 'express';
import sessionsArray from '../../models/sessionsArray';
import { IMessage } from 'interfaces/message';

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

// export const deleteMessage: RequestHandler = (req, res) => {
//   console.log(req.body);
//   return res.status(200).json({ message: req.body });
// };
