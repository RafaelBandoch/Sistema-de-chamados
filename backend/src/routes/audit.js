import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['admin']));

router.get('/', getAuditLogs);

export default router;
