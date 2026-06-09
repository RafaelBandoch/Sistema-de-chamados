import express from 'express';
import { login, logout, me } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { loginSchema } from '../validators/index.js';

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

export default router;
