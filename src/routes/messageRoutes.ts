import { Router } from 'express';

import { sendMessage } from '../controllers/api/messagesController';

const messageRouter: Router = Router();

messageRouter.post('/:name/send', sendMessage);

export default messageRouter;
