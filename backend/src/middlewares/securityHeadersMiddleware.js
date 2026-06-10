export const securityHeaders = (req, res, next) => {
    // Evita Clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Evita o ataque de "sniffing" de MIME type
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Filtro básico de XSS dos navegadores antigos (defesa em profundidade)
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Garante comunicação segura em HTTPS (HSTS)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Protege contra referências indesejadas (Referer header)
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Política de segurança de conteúdo mínima
    // Nota: Configuração restritiva básica que previne inline scripts não autorizados
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none'");

    // Impede que a aplicação vaze a versão de tecnologias usadas
    res.removeHeader('X-Powered-By');

    next();
};
