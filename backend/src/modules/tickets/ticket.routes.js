import express from 'express';
import { 
    createTicket, 
    getTickets, 
    getTicketById, 
    updateTicket, 
    cancelTicket,
    addObservation
} from './ticket.controller.js';
import { requireAuth } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRole(['solicitante', 'admin']), createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.put('/:id', requireRole(['solicitante', 'tecnico', 'admin']), updateTicket);
router.delete('/:id', requireRole(['solicitante']), cancelTicket);
router.post('/:id/history', requireRole(['tecnico', 'admin', 'solicitante']), addObservation);

export default router;
