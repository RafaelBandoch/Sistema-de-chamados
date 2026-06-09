import { z } from 'zod';

export const validate = (schema) => {
    return (req, res, next) => {
        try {
            // Parse and replace req.body with sanitized data
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const messages = error.errors.map(e => e.message);
                return res.status(400).json({ message: 'Erro de validação', errors: messages });
            }
            next(error);
        }
    };
};
