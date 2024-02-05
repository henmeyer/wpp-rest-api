import {
  DisconnectReason,
  WAMessageUpdate,
  WASocket,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

import { WhatsApp } from './whatsapp';
import logger from '../utils/logger';
import { deleteFolder } from '../utils/fs';
import redis from '../db/redis';
import { WHATSAPP_STATUS } from '../constants/whatsapp';

/**
 * Handle all Baileys this.socket events
 */
class WhatsAppMonitor {
  socket: WASocket;
  constructor(private whatsapp: WhatsApp) {
    this.socket = whatsapp.socket as WASocket;
    this.connectionUpdate();
    this.messageUpsert();
    this.messageUpdate();
  }
  connectionUpdate() {
    this.socket.ev.on(
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
            await this.whatsapp.startSocket();
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
            deleteFolder(this.whatsapp.folderPath);

            await this.whatsapp.startSocket();
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
            await this.whatsapp.startSocket();
          } else {
            await this.whatsapp.startSocket();
          }
        }
        // Connected
        else if (connection === 'open') {
          this.whatsapp.qrCount = 0;
        } else if (qr) {
          // Handling qr codes
          this.whatsapp.qrCount += 1;
          redis.set(`whatsapps:${this.whatsapp.name}`, {
            name: this.whatsapp.name,
            status: WHATSAPP_STATUS.qr,
          });
        }
      },
    );
  }

  messageUpsert() {
    this.socket.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type === 'notify') {
        for await (const msg of messages) {
          console.log(msg);
        }
      }
    });
  }

  messageUpdate() {
    this.socket.ev.on(
      'messages.update',
      async (messageUpdate: WAMessageUpdate[]) => {
        if (messageUpdate.length === 0) return;
        messageUpdate.forEach(async (message: WAMessageUpdate) => {
          console.log(message);
        });
      },
    );
  }
}

export default WhatsAppMonitor;
