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
    password: z.string()
        .min(8, 'A senha deve ter no mínimo 8 caracteres')
        .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
        .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
        .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
        .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial'),
    role: z.enum(['solicitante', 'tecnico', 'admin'], { errorMap: () => ({ message: 'Perfil inválido' }) }),
});

// Tickets
export const createTicketSchema = z.object({
    title: z.string().min(5, 'O título deve ter no mínimo 5 caracteres').max(255),
    description: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres'),
    category: z.string().min(2, 'A categoria é obrigatória'),
});

export const updateTicketSchema = z.object({
    status: z.enum(['aberto', 'em andamento', 'aguardando', 'resolvido', 'cancelado']).optional(),
    assigned_to: z.union([z.number(), z.string().transform(v => parseInt(v, 10))]).optional().nullable(),
});

export const addObservationSchema = z.object({
    comment: z.string().min(3, 'O comentário deve ter no mínimo 3 caracteres'),
});
