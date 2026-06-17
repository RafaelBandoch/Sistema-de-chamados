import express from 'express';
import { getUsers, createUser } from './user.controller.js';
import { requireAuth } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['admin']));

router.get('/', getUsers);
router.post('/', createUser);

export default router;
