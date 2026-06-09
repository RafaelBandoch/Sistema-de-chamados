import express from 'express';
import { 
    createTicket, 
    getTickets, 
    getTicketById, 
    updateTicket, 
    cancelTicket,
    addObservation
} from '../controllers/ticketController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/rbacMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createTicketSchema, updateTicketSchema, addObservationSchema } from '../validators/index.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRole(['solicitante', 'admin']), validate(createTicketSchema), createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.put('/:id', requireRole(['solicitante', 'tecnico', 'admin']), validate(updateTicketSchema), updateTicket);
router.delete('/:id', requireRole(['solicitante']), cancelTicket);
router.post('/:id/history', requireRole(['tecnico', 'admin', 'solicitante']), validate(addObservationSchema), addObservation);

export default router;
