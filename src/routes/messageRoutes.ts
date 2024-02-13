import { Router } from 'express';

import {
  editMessage,
  sendMessage,
  deleteMessage,
  reactMessage,
} from '../controllers/api/messagesController';

const messageRouter: Router = Router();

messageRouter.post('/:name', sendMessage);
messageRouter.put('/:name/:id', editMessage);
messageRouter.put('/:name/react/:id', reactMessage);
messageRouter.delete('/:name/:id', deleteMessage);

export default messageRouter;
