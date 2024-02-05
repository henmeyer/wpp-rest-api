import { Router } from 'express';
import { start, close } from '../controllers/api/whatsappsController';

const whatappRouter: Router = Router();

whatappRouter.put('/:name/start', start);
whatappRouter.put('/:name/close', close);

export default whatappRouter;
