import { Router } from 'express';
import {
  getAll, getById, create, update, remove,
  getGenres, getNowWatching, getNext,
} from '../controllers/contentController.js';

const router = Router();

router.get('/genres', getGenres);
router.get('/now',    getNowWatching);
router.get('/next',   getNext);
router.get('/',       getAll);
router.get('/:id',    getById);
router.post('/',      create);
router.put('/:id',    update);
router.delete('/:id', remove);

export default router;
