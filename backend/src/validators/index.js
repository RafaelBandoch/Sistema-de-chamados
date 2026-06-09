import { z } from 'zod';

// Auth
export const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
});

// Users
export const createUserSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(255),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(3, 'A senha deve ter no mínimo 3 caracteres'),
    role: z.enum(['solicitante', 'tecnico', 'admin'], { errorMap: () => ({ message: 'Perfil inválido' }) }),
});

// Tickets
export const createTicketSchema = z.object({
    title: z.string().min(5, 'O título deve ter no mínimo 5 caracteres').max(255),
    description: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres'),
});

export const updateTicketSchema = z.object({
    status: z.enum(['aberto', 'em andamento', 'aguardando', 'resolvido', 'cancelado']).optional(),
    assigned_to: z.union([z.number(), z.string().transform(v => parseInt(v, 10))]).optional().nullable(),
});

export const addObservationSchema = z.object({
    comment: z.string().min(3, 'O comentário deve ter no mínimo 3 caracteres'),
});
