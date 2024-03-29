import { RedisClientType, createClient, SchemaFieldTypes } from 'redis';
import logger from '../utils/logger';
import '../env';
import { EXPIRE_KEY_SECONDS } from '../constants';

export type RedisDataType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: string | object | number | any;
};

class Redis {
  client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
  }

  async connect() {
    this.client
      .connect()
      .then(() => {
        logger.info('Connected to Redis');
      })
      .catch(err => {
        logger.error('Failed to connect to Redis');
        logger.error(err);
      });
    this.createIndexes();
  }

  async disconnect() {
    await this.client
      .disconnect()
      .then(() => {
        logger.info('Disconnected from Redis');
      })
      .catch(err => {
        logger.error('Failed to disconnect from Redis');
        logger.error(err);
      });
  }

  async set(key: string, data: RedisDataType) {
    try {
      await this.client.json.set(key, '$', data);
      await this.client.expire(key, EXPIRE_KEY_SECONDS);
    } catch (error) {
      logger.error(error);
    }
  }

  async search(index: string, query: string) {
    try {
      return await this.client.ft.search(index, query);
    } catch (error) {
      logger.error(error);
    }
  }

  async get(key: string) {
    try {
      return (await this.client.json.get(key)) as RedisDataType;
    } catch (error) {
      logger.error(error);
    }
  }

  async delete(key: string) {
    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error(error);
    }
  }

  private async createIndexes() {
    await this.client.ft
      .create(
        'idx:whatsapps',
        {
          '$.name': {
            type: SchemaFieldTypes.TEXT,
            AS: 'name',
          },
          '$.status': {
            type: SchemaFieldTypes.NUMERIC,
            AS: 'status',
          },
        },
        {
          ON: 'JSON',
          PREFIX: 'whatsapps:',
        },
      )
      .then(() => {
        logger.info('idx:whatsapps index were created on Redis');
      })
      .catch(err => {
        if (err.message === 'Index already exists') {
          return;
        }
        logger.error('Failed to create indexes on Redis');
        logger.error(err);
      });

    await this.client.ft
      .create(
        'idx:messages',
        {
          '$.status': {
            type: SchemaFieldTypes.NUMERIC,
            AS: 'status',
          },
        },
        {
          ON: 'JSON',
          PREFIX: 'messages:',
        },
      )
      .then(() => {
        logger.info('idx:whatsapps index were created on Redis');
      })
      .catch(err => {
        if (err.message === 'Index already exists') {
          return;
        }
        logger.error('Failed to create indexes on Redis');
        logger.error(err);
      });
  }
}

export default new Redis();
