/**
 * Rate limiter simples para o frontend
 * Armazena tentativas no localStorage
 */

class RateLimiter {
    constructor() {
        this.storageKey = 'hcf_rate_limit';
        this.defaultLimits = {
            login: { max: 5, window: 15 * 60 * 1000 }, // 5 tentativas em 15 minutos
            api: { max: 100, window: 15 * 60 * 1000 }, // 100 requisições em 15 minutos
            upload: { max: 10, window: 60 * 1000 } // 10 uploads por minuto
        };
    }

    /**
     * Verifica se uma ação está dentro do limite
     * @param {string} action - Tipo de ação (login, api, upload)
     * @param {string} identifier - Identificador único (IP, user ID, etc.)
     * @returns {object} - { allowed: boolean, remaining: number, resetTime: number }
     */
    checkLimit(action, identifier = 'default') {
        const limits = this.defaultLimits[action];
        if (!limits) {
            return { allowed: true, remaining: Infinity, resetTime: 0 };
        }

        const key = `${action}_${identifier}`;
        const now = Date.now();
        const data = this.getStoredData(key);
        
        // Remove tentativas antigas
        const validAttempts = data.attempts.filter(timestamp => 
            now - timestamp < limits.window
        );

        const remaining = Math.max(0, limits.max - validAttempts.length);
        const allowed = validAttempts.length < limits.max;
        const resetTime = validAttempts.length > 0 ? 
            validAttempts[0] + limits.window : now;

        return { allowed, remaining, resetTime };
    }

    /**
     * Registra uma tentativa
     * @param {string} action - Tipo de ação
     * @param {string} identifier - Identificador único
     * @returns {boolean} - Se a tentativa foi registrada
     */
    recordAttempt(action, identifier = 'default') {
        const limits = this.defaultLimits[action];
        if (!limits) {
            return true;
        }

        const key = `${action}_${identifier}`;
        const now = Date.now();
        const data = this.getStoredData(key);
        
        // Remove tentativas antigas
        data.attempts = data.attempts.filter(timestamp => 
            now - timestamp < limits.window
        );

        // Verifica se ainda pode fazer tentativas
        if (data.attempts.length >= limits.max) {
            return false;
        }

        // Adiciona nova tentativa
        data.attempts.push(now);
        this.setStoredData(key, data);
        
        return true;
    }

    /**
     * Limpa tentativas de uma ação
     * @param {string} action - Tipo de ação
     * @param {string} identifier - Identificador único
     */
    clearAttempts(action, identifier = 'default') {
        const key = `${action}_${identifier}`;
        localStorage.removeItem(key);
    }

    /**
     * Limpa todas as tentativas
     */
    clearAllAttempts() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('hcf_rate_limit_')) {
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * Obtém dados armazenados
     * @param {string} key - Chave de armazenamento
     * @returns {object} - Dados armazenados
     */
    getStoredData(key) {
        try {
            const stored = localStorage.getItem(`${this.storageKey}_${key}`);
            return stored ? JSON.parse(stored) : { attempts: [] };
        } catch (error) {
            console.error('Erro ao ler dados de rate limit:', error);
            return { attempts: [] };
        }
    }

    /**
     * Armazena dados
     * @param {string} key - Chave de armazenamento
     * @param {object} data - Dados a serem armazenados
     */
    setStoredData(key, data) {
        try {
            localStorage.setItem(`${this.storageKey}_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Erro ao armazenar dados de rate limit:', error);
        }
    }

    /**
     * Formata tempo restante
     * @param {number} resetTime - Timestamp de reset
     * @returns {string} - Tempo formatado
     */
    formatResetTime(resetTime) {
        const now = Date.now();
        const remaining = Math.max(0, resetTime - now);
        
        if (remaining === 0) {
            return 'agora';
        }
        
        const minutes = Math.ceil(remaining / (60 * 1000));
        return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
    }
}

// Instância singleton
const rateLimiter = new RateLimiter();

export default rateLimiter;