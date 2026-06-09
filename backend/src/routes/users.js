import express from 'express';
import { getUsers, createUser } from '../controllers/userController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/rbacMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createUserSchema } from '../validators/index.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['admin']));

router.get('/', getUsers);
router.post('/', validate(createUserSchema), createUser);

export default router;
