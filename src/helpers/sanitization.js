import DOMPurify from 'dompurify';

/**
 * Sanitiza strings para prevenir XSS
 * @param {string} input - String a ser sanitizada
 * @returns {string} - String sanitizada
 */
export const sanitizeString = (input) => {
    if (typeof input !== 'string') {
        return input;
    }
    return DOMPurify.sanitize(input, { 
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
    });
};

/**
 * Sanitiza objetos recursivamente
 * @param {any} obj - Objeto a ser sanitizado
 * @returns {any} - Objeto sanitizado
 */
export const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
    }
    
    return obj;
};

/**
 * Valida e sanitiza input de formulário
 * @param {object} formData - Dados do formulário
 * @returns {object} - Dados sanitizados
 */
export const sanitizeFormData = (formData) => {
    return sanitizeObject(formData);
};

/**
 * Valida se uma string contém apenas caracteres seguros
 * @param {string} input - String a ser validada
 * @param {string} fieldName - Nome do campo para mensagens de erro
 * @returns {object} - { isValid: boolean, error?: string }
 */
export const validateSafeString = (input, fieldName = 'Campo') => {
    if (typeof input !== 'string') {
        return { isValid: false, error: `${fieldName} deve ser uma string` };
    }
    
    // Verifica se contém tags HTML perigosas
    const dangerousPatterns = [
        /<script/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /<link/i,
        /<meta/i,
        /javascript:/i,
        /vbscript:/i,
        /onload/i,
        /onerror/i,
        /onclick/i
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(input)) {
            return { 
                isValid: false, 
                error: `${fieldName} contém conteúdo não permitido` 
            };
        }
    }
    
    return { isValid: true };
};

/**
 * Sanitiza URL para prevenir ataques
 * @param {string} url - URL a ser sanitizada
 * @returns {string} - URL sanitizada
 */
export const sanitizeUrl = (url) => {
    if (typeof url !== 'string') {
        return '';
    }
    
    // Remove protocolos perigosos
    const dangerousProtocols = ['javascript:', 'vbscript:', 'data:', 'file:'];
    const lowerUrl = url.toLowerCase();
    
    for (const protocol of dangerousProtocols) {
        if (lowerUrl.startsWith(protocol)) {
            return '';
        }
    }
    
    return DOMPurify.sanitize(url);
};

export default {
    sanitizeString,
    sanitizeObject,
    sanitizeFormData,
    validateSafeString,
    sanitizeUrl
};