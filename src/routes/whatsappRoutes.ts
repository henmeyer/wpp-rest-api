import { Router } from 'express';
import { start, close } from '../controllers/api/whatsappsController';

const whatappRouter: Router = Router();

whatappRouter.post('/:name', start);
whatappRouter.put('/:name/close', close);

export default whatappRouter;
