import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import authRoutes from './routes/auth.js';
import ticketRoutes from './routes/tickets.js';
import userRoutes from './routes/users.js';
import auditRoutes from './routes/audit.js';

dotenv.config({ path: '../.env' });

const app = express();

app.use(express.json());
app.use(cookieParser());

// Prevenção contra ataques Stored XSS (limpa tags HTML dos inputs do usuário)
app.use(xss());

// Adicionando cabeçalhos HTTP de segurança
app.use(helmet());

// Limite de requisições geral para a API (Prevenção contra DDoS)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limita cada IP a 100 requisições por windowMs
    message: { message: 'Muitas requisições deste IP, tente novamente mais tarde.' }
});

// Limite restrito para tentativas de login (Prevenção contra Força Bruta)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Limita cada IP a 5 requisições de login por windowMs
    message: { message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
});

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // Allow sending cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Restringe métodos permitidos (Hardening)
}));

// Aplica limiter nas rotas da API
app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
