import { Router } from 'express';
import { getSummary, getByGenre, getByType, getMonthly, getTopRated } from '../controllers/insightsController.js';

const router = Router();

router.get('/summary',    getSummary);
router.get('/by-genre',   getByGenre);
router.get('/by-type',    getByType);
router.get('/monthly',    getMonthly);
router.get('/top-rated',  getTopRated);

export default router;
