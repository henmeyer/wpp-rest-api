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
import { Message } from './message';
import sessionsArray from './sessionsArray';
import WhatsAppMonitor from './whatsAppMonitor';
import redis from '../db/redis';

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
    return `${process.env.WPP_SESSIONS_PATH || './wpp_sessions'}/${this.name}`;
  }

  async start() {
    try {
      createFolder(this.folderPath);
      await this.startSocket();
      sessionsArray.push(this);
      this.startWhatsAppMonitor();
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

  async sendMessage(to: string, message: Message) {
    try {
      if (!this.socket) throw new Error('WhatsApp not found.');
      const sentMessage = await this.socket.sendMessage(to, {
        text: message.content,
      });
      console.log(sentMessage);
      return sentMessage;
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

  startWhatsAppMonitor() {
    new WhatsAppMonitor(this);
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
