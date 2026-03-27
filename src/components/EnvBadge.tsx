const ENV_LABELS: Record<string, string> = {
    production: 'PRODUÇÃO',
}

const ENV_COLORS: Record<string, string> = {
    production: '#dc2626',
}

const DEFAULT_LABEL = 'DESENVOLVIMENTO'
const DEFAULT_COLOR = '#0369a1'

interface EnvBadgeProps {
    env: string
}

export function EnvBadge({ env }: EnvBadgeProps) {
    const label = ENV_LABELS[env] ?? DEFAULT_LABEL
    const color = ENV_COLORS[env] ?? DEFAULT_COLOR

    return (
        <span
            aria-label={`Ambiente: ${label}`}
            style={{
                display: 'inline-block',
                borderRadius: 4,
                padding: '2px 12px',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 0.5,
                color: '#fff',
                backgroundColor: color,
                userSelect: 'none',
            }}
        >
            Ambiente de {label}
        </span>
    )
}
