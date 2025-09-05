# Guia de Segurança - HCF Painel

## Medidas de Segurança Implementadas

### 1. Autenticação JWT
- **Header Authorization**: Usa `Authorization: Bearer <token>` (padrão)
- **Token Storage**: Armazenado no localStorage com validação automática
- **Auto-logout**: Redirecionamento automático em caso de token inválido (401)

### 2. Rate Limiting Frontend
- **Login**: 5 tentativas por 15 minutos por email
- **API**: 100 requisições por 15 minutos
- **Upload**: 10 uploads por minuto
- **Storage**: Dados armazenados no localStorage com limpeza automática

### 3. Sanitização de Input
- **DOMPurify**: Sanitização de strings para prevenir XSS
- **Validação**: Verificação de padrões perigosos
- **Recursiva**: Sanitização de objetos e arrays
- **URLs**: Validação de URLs para prevenir ataques

### 4. Logs de Debug Removidos
- Todos os `console.log` de debug foram removidos/comentados
- Mantidos apenas logs de erro críticos
- Prevenção de vazamento de informações sensíveis

## Estrutura de Segurança

### Helpers de Segurança

#### `src/helpers/sanitization.js`
```javascript
import { sanitizeString, sanitizeObject, validateSafeString } from '../helpers/sanitization';

// Sanitizar string
const clean = sanitizeString(userInput);

// Sanitizar objeto
const cleanData = sanitizeObject(formData);

// Validar string segura
const validation = validateSafeString(input, 'Nome');
```

#### `src/helpers/rateLimiter.js`
```javascript
import rateLimiter from '../helpers/rateLimiter';

// Verificar limite
const check = rateLimiter.checkLimit('login', email);

// Registrar tentativa
const recorded = rateLimiter.recordAttempt('login', email);

// Limpar tentativas
rateLimiter.clearAttempts('login', email);
```

### Configuração de Ambiente

#### Variáveis de Ambiente Obrigatórias
```env
VITE_API_URL=https://api.hcf.cm.utfpr.edu.br
VITE_IMAGE_BASE_URL=https://images.hcf.cm.utfpr.edu.br
VITE_REPORT_BASE_URL=https://reports.hcf.cm.utfpr.edu.br
VITE_RECAPTCHA_SITE_KEY=sua-chave-recaptcha
```

## Boas Práticas Implementadas

### 1. Sanitização de Dados
- **Sempre sanitizar** dados do usuário antes de exibir
- **Validar inputs** antes de enviar para API
- **Usar DOMPurify** para conteúdo HTML

### 2. Rate Limiting
- **Verificar limites** antes de fazer requisições
- **Registrar tentativas** falhadas
- **Limpar tentativas** em sucessos

### 3. Gerenciamento de Token
- **Verificar expiração** automaticamente
- **Limpar dados** em logout
- **Redirecionar** em caso de token inválido

### 4. Tratamento de Erros
- **Não expor** informações sensíveis em erros
- **Logar erros** apenas no console de desenvolvimento
- **Mostrar mensagens** genéricas para usuários

## Exemplos de Uso

### Sanitização em Formulários
```javascript
import { sanitizeFormData, validateSafeString } from '../helpers/sanitization';

handleSubmit = (values) => {
    // Validar dados
    const nameValidation = validateSafeString(values.nome, 'Nome');
    if (!nameValidation.isValid) {
        this.showError(nameValidation.error);
        return;
    }
    
    // Sanitizar dados
    const cleanData = sanitizeFormData(values);
    
    // Enviar para API
    this.submitForm(cleanData);
}
```

### Rate Limiting em Requisições
```javascript
import rateLimiter from '../helpers/rateLimiter';

makeApiCall = async (data) => {
    // Verificar rate limit
    const limitCheck = rateLimiter.checkLimit('api');
    if (!limitCheck.allowed) {
        this.showError('Muitas requisições. Tente novamente em alguns minutos.');
        return;
    }
    
    try {
        const response = await axios.post('/api/endpoint', data);
        return response.data;
    } catch (error) {
        // Registrar tentativa falhada
        rateLimiter.recordAttempt('api');
        throw error;
    }
}
```

## Monitoramento de Segurança

### Indicadores a Observar
- **Tentativas de login** excessivas
- **Erros 401** frequentes
- **Rate limit** sendo atingido
- **Console errors** em produção

### Logs de Segurança
- Rate limiting: Tentativas bloqueadas
- Autenticação: Logins falhados
- Sanitização: Dados perigosos detectados

## Próximos Passos Recomendados

1. **Implementar CSP** (Content Security Policy)
2. **Configurar HTTPS** em produção
3. **Implementar 2FA** para usuários administrativos
4. **Configurar monitoramento** de segurança
5. **Implementar backup** automático
6. **Configurar alertas** de segurança

## Contato de Segurança

Para reportar vulnerabilidades de segurança, entre em contato com:
- Email: e.nani@gmail.com
- Assunto: [SECURITY] Vulnerabilidade HCF Painel

## Atualizações de Segurança

Este documento deve ser atualizado sempre que:
- Novas vulnerabilidades forem corrigidas
- Novas medidas de segurança forem implementadas
- Dependências forem atualizadas
- Configurações de segurança forem alteradas