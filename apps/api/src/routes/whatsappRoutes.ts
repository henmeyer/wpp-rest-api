import { Router } from 'express';
import { start, close } from '../controllers/api/whatsappsController';

const whatappRouter: Router = Router();

whatappRouter.post('/:name', start);
whatappRouter.delete('/:name', close);

export default whatappRouter;
