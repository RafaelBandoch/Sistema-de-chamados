// Utilitário simples e sem dependências para escapar entidades HTML
// e prevenir Cross-Site Scripting (XSS).
export const escapeHtml = (unsafeString) => {
    if (typeof unsafeString !== 'string') return unsafeString;
    return unsafeString
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
