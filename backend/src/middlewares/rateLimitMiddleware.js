export const createRateLimiter = (maxRequests, windowMs) => {
    const hits = new Map();

    // Uma função de limpeza automática para não estourar a memória (Memory Leak)
    setInterval(() => {
        const now = Date.now();
        for (const [ip, data] of hits.entries()) {
            if (now > data.resetTime) {
                hits.delete(ip);
            }
        }
    }, windowMs);

    return (req, res, next) => {
        // Pega o IP, tenta pegar o x-forwarded-for caso esteja atrás de proxy (nginx/load balancer)
        const ip = req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress || '127.0.0.1';
        
        const now = Date.now();

        if (!hits.has(ip)) {
            hits.set(ip, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }

        const data = hits.get(ip);

        // Se a janela de tempo já passou, reseta a contagem
        if (now > data.resetTime) {
            data.count = 1;
            data.resetTime = now + windowMs;
            return next();
        }

        // Se ainda está na janela de tempo, incrementa
        data.count++;

        if (data.count > maxRequests) {
            const retryAfterSec = Math.ceil((data.resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfterSec);
            return res.status(429).json({
                message: `Muitas requisições. Tente novamente em ${retryAfterSec} segundos.`,
            });
        }

        next();
    };
};

// Configuração padrão para login (Ex: Máx 5 tentativas a cada 15 min)
export const loginLimiter = createRateLimiter(5, 15 * 60 * 1000);

// Configuração para criação de usuários (Ex: Máx 3 contas a cada 1 hora)
export const createUserLimiter = createRateLimiter(3, 60 * 60 * 1000);
