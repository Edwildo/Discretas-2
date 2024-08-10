import { Router } from 'express';
import { getChatResponse} from '../controllers/chatbotController.js';

const router = Router();

router.get('/', getChatResponse.chat);

export default router;
