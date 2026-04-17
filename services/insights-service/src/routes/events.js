import { Router } from 'express';
import { createEvent } from '../controllers/eventsController.js';

const router = Router();

router.post('/', createEvent);

export default router;
