import { DisconnectReason, WAMessageUpdate } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

import { WhatsApp } from '../../models/whatsapp';
import logger from '../../utils/logger';
import { deleteFolder } from '../../utils/fs';
import redis from '../../db/redis';
import { WHATSAPP_STATUS } from '../../constants/whatsapp';

/**
 * Handle all Baileys whatsapp.socket events
 */
const whatsAppMonitor = (whatsapp: WhatsApp) => {
  if (!whatsapp || !whatsapp.socket)
    throw Error('WhatsApp is closed or do not exists');

  whatsapp.socket.ev.on(
    'connection.update',
    // events is a map for event name => event data
    async ({ connection, qr, lastDisconnect }) => {
      // Handling connection closing
      if (connection === 'close') {
        const reason = (lastDisconnect?.error as Boom)?.output;
        if (
          // Handle restartRequired
          reason.statusCode === DisconnectReason.restartRequired
        ) {
          await whatsapp.startSocket();
        } else if (
          // Handle disconnected via Evolvy
          reason.payload.message === 'Disconnected by user'
        ) {
          logger.info(`Connection closed.`);
        } else if (
          // Handle disconnected via mobile
          reason.statusCode === DisconnectReason.loggedOut
        ) {
          logger.info('logged out');
          deleteFolder(whatsapp.folderPath);

          await whatsapp.startSocket();
        } else if (
          // Handling connection conflict
          reason.statusCode === DisconnectReason.connectionReplaced
        ) {
          logger.info(`Connection conflict!`);
        } else if (
          // Handling Precondition Required
          reason.statusCode === DisconnectReason.connectionClosed
        ) {
          logger.info(`Connection closed.`);
          await whatsapp.startSocket();
        } else {
          await whatsapp.startSocket();
        }
      }
      // Connected
      else if (connection === 'open') {
        whatsapp.qrCount = 0;
        redis.set(`whatsapps:${whatsapp.name}`, {
          name: whatsapp.name,
          status: WHATSAPP_STATUS.connected,
        });
      } else if (qr) {
        // Handling qr codes
        whatsapp.qrCount += 1;
        redis.set(`whatsapps:${whatsapp.name}`, {
          name: whatsapp.name,
          status: WHATSAPP_STATUS.qr,
        });
      }
    },
  );

  whatsapp.socket.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type === 'notify') {
      for await (const msg of messages) {
        console.log(msg);
      }
    }
  });

  whatsapp.socket.ev.on(
    'messages.update',
    async (messageUpdate: WAMessageUpdate[]) => {
      if (messageUpdate.length === 0) return;
      messageUpdate.forEach(async (message: WAMessageUpdate) => {
        console.log(message);
      });
    },
  );
};

export default whatsAppMonitor;
