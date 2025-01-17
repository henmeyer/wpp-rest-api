import NodeCache from 'node-cache';
import makeWASocket, {
  fetchLatestBaileysVersion,
  isJidStatusBroadcast,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  WASocket,
} from '@whiskeysockets/baileys';

import logger from '../utils/logger';
import { createFolder, deleteFolder } from '../utils/fs';
import { IMessage } from '../interfaces/message';
import sessionsArray from './sessionsArray';
import redis from '../db/redis';
import whatsAppMonitor from '../services/whatsappServices/monitorService';
import { RedisMessage } from '../interfaces/redis';

// external map to store retry counts of messages when decryption/encryption fails
// keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
const msgRetryCounterCache = new NodeCache();

export class WhatsApp {
  readonly name: string;
  socket: WASocket | undefined;
  qrCount: number = 0;

  constructor(name: string) {
    this.name = name;
    this.start();
  }

  get folderPath(): string {
    return `${process.env.WPP_SESSIONS_PATH || './.wpp_sessions'}/${this.name}`;
  }

  async start() {
    try {
      createFolder(this.folderPath);
      await this.startSocket();
      sessionsArray.push(this);
      whatsAppMonitor(this);
      logger.info(`${this.name} has started`);
    } catch (error) {
      logger.error(error);
    }
  }

  async close() {
    try {
      if (!this.socket) throw new Error('WhatsApp not found.');
      await this.socket.logout('Disconnected by user');
      deleteFolder(this.folderPath);
      sessionsArray.pop(this.name);
      redis.delete(`whatsapps:${this.name}`);
      logger.info(`${this.name} has been closed`);
    } catch (error) {
      logger.error(error);
    }
  }

  async sendTextMessage(to: string, message: IMessage) {
    try {
      if (!this.socket) throw new Error('WhatsApp not found.');
      if (!message.text) throw new Error('Message is blank.');
      const sentMessage = await this.socket.sendMessage(to, {
        text: message.text,
      });
      if (!sentMessage) throw Error(`Message to ${to} was not sent`);

      redis.set(`messages:${sentMessage.key.id}`, {
        key: sentMessage.key,
        status: sentMessage.status,
      });
      return sentMessage;
    } catch (error) {
      logger.error(error);
    }
  }

  async sendAttachmentsMessage(to: string, message: IMessage) {
    try {
      if (!this.socket) throw new Error('WhatsApp not found.');

      if (!message?.attachment) return;

      const sentMessage = await this.socket.sendMessage(to, {
        image: { url: message.attachment.url },
        caption: message?.text,
        mimetype: message.attachment.mimetype,
      });

      if (!sentMessage) throw Error(`Message to ${to} was not sent`);

      redis.set(`messages:${sentMessage.key.id}`, {
        key: sentMessage.key,
        status: sentMessage.status,
      });

      return sentMessage;
    } catch (error) {
      logger.error(error);
    }
  }

  async deleteMessage(messageId: string) {
    try {
      if (!this.socket) throw new Error('WhatsApp not found.');

      const deletedMessage = (await redis.get(
        `messages:${messageId}`,
      )) as RedisMessage;

      if (!deletedMessage || !deletedMessage.key.remoteJid)
        throw Error(`${messageId} not found`);

      await redis.delete(`messages:${messageId}`);

      return await this.socket.sendMessage(deletedMessage.key.remoteJid, {
        delete: deletedMessage.key,
      });
    } catch (error) {
      logger.error(error);
    }
  }

  async reactMessage(messageId: string, reaction: string | undefined) {
    try {
      if (!this.socket) throw new Error('WhatsApp not found.');

      const reactedMessage = (await redis.get(
        `messages:${messageId}`,
      )) as RedisMessage;

      if (!reactedMessage || !reactedMessage.key.remoteJid)
        throw Error(`${messageId} not found`);

      return await this.socket.sendMessage(reactedMessage.key.remoteJid, {
        react: { key: reactedMessage.key, text: reaction || '' },
      });
    } catch (error) {
      logger.error(error);
    }
  }

  async editMessage(messageId: string, newText: string) {
    try {
      if (!this.socket) throw new Error('WhatsApp not found.');

      const editedMessage = (await redis.get(
        `messages:${messageId}`,
      )) as RedisMessage;

      if (!editedMessage || !editedMessage.key.remoteJid)
        throw Error(`${messageId} not found`);

      return await this.socket.sendMessage(editedMessage.key.remoteJid, {
        edit: editedMessage.key,
        text: newText,
      });
    } catch (error) {
      logger.error(error);
    }
  }

  async whatsAppPhoneNumber(phoneNumber: string): Promise<string | undefined> {
    try {
      if (!this.socket) throw new Error('WhatsApp not found.');
      const whatsAppNumber = await this.socket.onWhatsApp(
        `+${phoneNumber}@s.whatsapp.net`,
      );
      return whatsAppNumber[0]?.jid;
    } catch (error) {
      logger.error(error);
    }
  }

  async startSocket() {
    const { state, saveCreds } = await useMultiFileAuthState(this.folderPath);

    // fetch latest version of WA Web
    const { version } = await fetchLatestBaileysVersion();

    this.socket = makeWASocket({
      defaultQueryTimeoutMs: undefined,
      version,
      logger: logger,
      printQRInTerminal: true,
      auth: {
        creds: state.creds,
        /** caching makes the store faster to send/recv messages */
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      generateHighQualityLinkPreview: false,
      markOnlineOnConnect: false,
      msgRetryCounterCache,
      retryRequestDelayMs: 2000,
      shouldIgnoreJid: jid => isJidStatusBroadcast(jid),
    });

    // credentials updated -- save them
    this.socket!.ev.on('creds.update', async () => {
      await saveCreds();
    });
    return this.socket;
  }
}
