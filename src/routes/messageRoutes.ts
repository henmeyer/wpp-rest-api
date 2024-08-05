import { Router } from 'express';

import {
  editMessage,
  sendMessage,
  deleteMessage,
  reactMessage,
} from '../controllers/api/messagesController';
import { authenticateToken } from '../middleware/jwt';

const messageRouter: Router = Router();

messageRouter.post('/:name', authenticateToken, sendMessage);
messageRouter.put('/:name/:id', authenticateToken, editMessage);
messageRouter.put('/:name/react/:id', authenticateToken, reactMessage);
messageRouter.delete('/:name/:id', authenticateToken, deleteMessage);

export default messageRouter;
