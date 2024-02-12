import { type WAMessageKey } from '@whiskeysockets/baileys';

export interface RedisMessage {
  status: number;
  key: WAMessageKey;
}
