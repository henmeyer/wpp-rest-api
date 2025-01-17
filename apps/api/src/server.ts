import express from 'express';
import bodyParser from 'body-parser';

import router from './routes';
import Redis from './db/redis';
import logger from './utils/logger';
import startAllWhatsAppsService from './services/startAllWhatsAppsService';
import './env';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use((req: any, res: any, next: any) => {
  res.append('Access-Control-Allow-Origin', '*');
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/api', router);

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

Redis.connect();

setTimeout(() => {
  startAllWhatsAppsService();
}, 1000);
