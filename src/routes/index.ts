import { Router } from 'express';
import messageRouter from './messageRoutes';
import whatappRouter from './whatsappRoutes';

const router: Router = Router();

router.use('/messages', messageRouter);
router.use('/whatsapps', whatappRouter);

export default router;
