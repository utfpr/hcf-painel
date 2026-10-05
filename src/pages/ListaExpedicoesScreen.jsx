import { useCallback, useEffect, useRef, useState } from 'react'

import { Alert, Avatar, Button, Card, Col, DatePicker, Divider, Dropdown, Empty, Form, Pagination, Row, Select, Spin, Tag, Tooltip, Typography } from 'antd'
import axios from 'axios'
import moment from 'moment'
import { Link, useNavigate } from 'react-router'

import { EditOutlined, EllipsisOutlined, InboxOutlined, ReloadOutlined } from '@ant-design/icons'

import HeaderListComponent from '../components/HeaderListComponent'

const PAGE_SIZE = 20
const DATE_FORMAT = 'DD/MM/YYYY'
const API_DATE_FORMAT = 'YYYY-MM-DD'

const emptyList = () => ({ items: [], total: 0, page: 1, pageSize: PAGE_SIZE, loading: true, error: false })

export function expeditionParams(category, filters, page = 1, pageSize = PAGE_SIZE, today = moment()) {
    const params = {
        pagina: page,
        limite: pageSize,
        // A API espera "coluna:direção" e responde 400 a qualquer outro formato.
        // Próximas: a que inicia primeiro vem antes. Realizadas: a que terminou por último vem antes.
        order: category === 'upcoming' ? 'data_inicio:asc' : 'data_fim:desc'
    }

    if (filters.cidade_id) params.cidade_id = filters.cidade_id
    if (filters.usuario_id) params.usuario_id = filters.usuario_id
    if (filters.data_inicio_de) params.data_inicio_de = filters.data_inicio_de.format(API_DATE_FORMAT)
    if (filters.data_fim_ate) params.data_fim_ate = filters.data_fim_ate.format(API_DATE_FORMAT)

    // Próximas: ainda não realizadas (data_fim >= hoje), o que mantém a expedição em curso na lista.
    // Realizadas: data_fim <= ontem.
    if (category === 'upcoming') {
        params.data_fim_de = today.format(API_DATE_FORMAT)
    } else {
        const lastDay = today.clone().subtract(1, 'day').format(API_DATE_FORMAT)
        if (!params.data_fim_ate || params.data_fim_ate > lastDay) params.data_fim_ate = lastDay
    }

    return params
}

export function expeditionFromApi(item) {
    // A listagem já devolve cidade_nome e estado_sigla, então não é preciso resolver o destino pelo id.
    return {
        id: item.id,
        description: item.descricao,
        startDate: item.data_inicio,
        endDate: item.data_fim,
        destination: item.cidade_nome
            ? [item.cidade_nome, item.estado_sigla].filter(Boolean).join('/')
            : `Cidade #${item.cidade_id}`,
        participants: Array.isArray(item.participantes)
            ? item.participantes.map(participant => ({ id: participant.id, name: participant.nome }))
            : []
    }
}

// O moment do projeto não carrega o locale pt-br, então os meses ficam aqui.
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const parseDate = date => moment(date, API_DATE_FORMAT).startOf('day')
const formatDay = (date, withYear) => `${date.date()} ${MONTHS[date.month()]}${withYear ? ` ${date.year()}` : ''}`
const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`

// Ex.: "14–18 out 2026 · 5 dias", "29 out – 1 nov 2026 · 4 dias", "28 dez 2026 – 2 jan 2027 · 6 dias".
export function expeditionPeriod(startDate, endDate) {
    const start = parseDate(startDate)
    if (!endDate) return formatDay(start, true)
    const end = parseDate(endDate)
    const days = end.diff(start, 'days') + 1
    let range
    if (days === 1) range = formatDay(start, true)
    else if (start.year() !== end.year()) range = `${formatDay(start, true)} – ${formatDay(end, true)}`
    else if (start.month() !== end.month()) range = `${formatDay(start, false)} – ${formatDay(end, true)}`
    else range = `${start.date()}–${formatDay(end, true)}`
    return `${range} · ${plural(days, 'dia', 'dias')}`
}

export function expeditionStatus(startDate, endDate, today = moment()) {
    const day = today.clone().startOf('day')
    const start = parseDate(startDate)
    const end = endDate ? parseDate(endDate) : start
    if (day.isBefore(start)) {
        const days = start.diff(day, 'days')
        return { label: days === 1 ? 'Amanhã' : `Em ${days} dias`, color: 'blue' }
    }
    if (!day.isAfter(end)) return { label: 'Em andamento', color: 'green' }
    const days = day.diff(end, 'days')
    return { label: days === 1 ? 'Realizada ontem' : `Realizada há ${days} dias`, color: 'default' }
}

const initials = name => {
    const words = (name || '?').trim().split(/\s+/)
    return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2)).toUpperCase()
}

const actionsMenu = {
    items: [
        { key: 'edit', icon: <EditOutlined />, label: 'Editar' },
        {
            key: 'archive',
            icon: <InboxOutlined />,
            label: <Tooltip title="A API disponibiliza exclusão, mas ainda não oferece arquivamento.">Arquivar</Tooltip>,
            disabled: true
        }
    ]
}

function ExpeditionCard({ item }) {
    const navigate = useNavigate()
    const detailsUrl = `/expedicoes/detalhes/${encodeURIComponent(item.id)}`
    const status = expeditionStatus(item.startDate, item.endDate)
    const menu = {
        ...actionsMenu,
        onClick: ({ key }) => {
            if (key === 'edit') navigate(`/expedicoes/${encodeURIComponent(item.id)}`)
        }
    }

    return (
        <Card
            hoverable
            onClick={() => navigate(detailsUrl)}
            // A borda padrão do Card (#f0f0f0) quase some no fundo da tela; #d9d9d9 é a cor de borda base do antd.
            style={{ height: '100%', border: '1px solid #d9d9d9' }}
            bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                    {/* O link mantém a navegação por teclado e o "abrir em nova aba"; o clique no card cobre o resto. */}
                    <Link to={detailsUrl} onClick={event => event.stopPropagation()} style={{ color: 'inherit' }}>{item.destination}</Link>
                </Typography.Title>
                <Tag color={status.color} style={{ marginRight: 0, flexShrink: 0 }}>{status.label}</Tag>
            </div>
            <Typography.Text type="secondary">{expeditionPeriod(item.startDate, item.endDate)}</Typography.Text>

            <Typography.Paragraph
                ellipsis={{ rows: 2, tooltip: item.description }}
                type={item.description ? undefined : 'secondary'}
                style={{ margin: '16px 0', flexGrow: 1 }}
            >
                {item.description || 'Sem descrição.'}
            </Typography.Paragraph>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {item.participants.length > 0 && (
                    <Avatar.Group maxCount={4} size="small">
                        {item.participants.map(participant => (
                            <Tooltip key={participant.id} title={participant.name}>
                                <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>{initials(participant.name)}</Avatar>
                            </Tooltip>
                        ))}
                    </Avatar.Group>
                )}
                <Typography.Text type="secondary">{plural(item.participants.length, 'participante', 'participantes')}</Typography.Text>
                <Typography.Text type="secondary" style={{ marginLeft: 'auto' }}>{`#${item.id}`}</Typography.Text>
                {/* O span impede que o clique no menu abra os detalhes da expedição. */}
                <span onClick={event => event.stopPropagation()}>
                    <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
                        <Button type="text" size="small" icon={<EllipsisOutlined />} aria-label={`Ações da expedição #${item.id}`} />
                    </Dropdown>
                </span>
            </div>
        </Card>
    )
}

function ExpeditionSection({ title, data, onPageChange, onRetry, filtered }) {
    return (
        <section aria-label={title} style={{ marginBottom: 32 }}>
            <h3>
                {title}
                {' '}
                <span style={{ fontWeight: 400, color: '#666' }}>
                    (
                    {data.total}
                    )
                </span>
            </h3>
            {data.error
                ? <Alert type="error" showIcon message="Não foi possível carregar as expedições." action={<Button icon={<ReloadOutlined />} onClick={onRetry}>Tentar novamente</Button>} />
                : (
                    <Spin spinning={data.loading} tip="Carregando expedições">
                        {!data.loading && (data.items.length === 0
                            ? <Empty description={filtered ? 'Nenhuma expedição corresponde aos filtros.' : 'Nenhuma expedição nesta categoria.'} />
                            : (
                                <>
                                    <Row gutter={[16, 16]}>
                                        {data.items.map(item => (
                                            <Col key={item.id} xs={24} md={12} xl={8}>
                                                <ExpeditionCard item={item} />
                                            </Col>
                                        ))}
                                    </Row>
                                    <Pagination
                                        style={{ marginTop: 20, textAlign: 'right' }}
                                        current={data.page}
                                        pageSize={data.pageSize}
                                        total={data.total}
                                        showSizeChanger
                                        pageSizeOptions={['20', '50', '100']}
                                        onChange={onPageChange}
                                        showTotal={total => `${total} expedições`}
                                    />
                                </>
                            ))}
                    </Spin>
                )}
        </section>
    )
}

export default function ListaExpedicoesScreen() {
    const [form] = Form.useForm()
    const [filters, setFilters] = useState({})
    const [cities, setCities] = useState([])
    const [citiesLoading, setCitiesLoading] = useState(true)
    const [citiesError, setCitiesError] = useState(false)
    const [users, setUsers] = useState([])
    const [usersLoading, setUsersLoading] = useState(true)
    const [usersError, setUsersError] = useState(false)
    const [lists, setLists] = useState({ upcoming: emptyList(), past: emptyList() })
    const requests = useRef({ upcoming: 0, past: 0 })

    useEffect(() => {
        let active = true
        axios.get('/cidades')
            .then(response => {
                if (!Array.isArray(response.data)) throw new Error('Resposta inválida de cidades')
                if (active) setCities(response.data)
            })
            .catch(() => {
                if (active) setCitiesError(true)
            })
            .finally(() => {
                if (active) setCitiesLoading(false)
            })
        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        let active = true
        axios.get('/usuarios', { params: { limite: 1000 } })
            .then(response => {
                if (!Array.isArray(response.data?.usuarios)) throw new Error('Resposta inválida de usuários')
                if (active) setUsers(response.data.usuarios)
            })
            .catch(() => {
                if (active) setUsersError(true)
            })
            .finally(() => {
                if (active) setUsersLoading(false)
            })
        return () => {
            active = false
        }
    }, [])

    const load = useCallback(async (category, currentFilters, page, pageSize) => {
        const request = ++requests.current[category]
        setLists(previous => ({ ...previous, [category]: { ...previous[category], loading: true, error: false } }))
        try {
            const params = expeditionParams(category, currentFilters, page, pageSize)
            const response = await axios.get('/v2/expedicoes', { params })
            const { itens, total, pagina, limite } = response.data
            if (!Array.isArray(itens) || !Number.isFinite(total)) throw new Error('Resposta inválida da API de expedições')
            if (request !== requests.current[category]) return
            setLists(previous => ({
                ...previous,
                [category]: {
                    items: itens,
                    total,
                    page: pagina,
                    pageSize: limite,
                    loading: false,
                    error: false
                }
            }))
        } catch {
            if (request !== requests.current[category]) return
            setLists(previous => ({ ...previous, [category]: { ...previous[category], loading: false, error: true } }))
        }
    }, [])

    useEffect(() => {
        load('upcoming', filters, lists.upcoming.page, lists.upcoming.pageSize)
    }, [filters, lists.upcoming.page, lists.upcoming.pageSize, load])

    useEffect(() => {
        load('past', filters, lists.past.page, lists.past.pageSize)
    }, [filters, lists.past.page, lists.past.pageSize, load])

    const search = values => {
        setLists(previous => ({
            upcoming: { ...previous.upcoming, page: 1 },
            past: { ...previous.past, page: 1 }
        }))
        setFilters(values)
    }

    const clear = () => {
        form.resetFields()
        search({})
    }

    const changePage = category => (page, pageSize) => {
        setLists(previous => ({ ...previous, [category]: { ...previous[category], page, pageSize } }))
    }

    const filtered = Boolean(filters.cidade_id || filters.usuario_id || filters.data_inicio_de || filters.data_fim_ate)
    const section = (category, title) => {
        const data = lists[category]
        const items = data.items.map(item => expeditionFromApi(item))
        return (
            <ExpeditionSection
                title={title}
                data={{ ...data, items }}
                onPageChange={changePage(category)}
                onRetry={() => load(category, filters, data.page, data.pageSize)}
                filtered={filtered}
            />
        )
    }

    return (
        <div>
            <HeaderListComponent title="Expedições" link="/expedicoes/novo" />
            <Divider dashed />
            <Card title="Buscar expedições" style={{ marginBottom: 24 }}>
                <Form form={form} layout="vertical" onFinish={search}>
                    <Row gutter={16}>
                        <Col xs={24} md={12} xl={6}>
                            <Form.Item label="Início a partir de" name="data_inicio_de"><DatePicker format={DATE_FORMAT} style={{ width: '100%' }} /></Form.Item>
                        </Col>
                        <Col xs={24} md={12} xl={6}>
                            <Form.Item label="Fim até" name="data_fim_ate"><DatePicker format={DATE_FORMAT} style={{ width: '100%' }} /></Form.Item>
                        </Col>
                        <Col xs={24} md={12} xl={6}>
                            <Form.Item label="Cidade de destino" name="cidade_id">
                                <Select showSearch allowClear optionFilterProp="children" placeholder="Selecione uma cidade" loading={citiesLoading}>
                                    {cities.map(city => <Select.Option key={city.id} value={city.id}>{city.nome}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12} xl={6}>
                            <Form.Item label="Participante" name="usuario_id">
                                <Select showSearch allowClear optionFilterProp="children" placeholder="Selecione um participante" loading={usersLoading}>
                                    {users.map(user => <Select.Option key={user.id} value={Number(user.id)}>{user.nome}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify="end" gutter={8}>
                        <Col><Button onClick={clear}>Limpar</Button></Col>
                        <Col><Button type="primary" htmlType="submit" className="ant-btn-pesquisar">Pesquisar</Button></Col>
                    </Row>
                </Form>
            </Card>
            {citiesError && <Alert type="warning" showIcon style={{ marginBottom: 24 }} message="Não foi possível carregar as cidades. O filtro por cidade de destino ficará indisponível." />}
            {usersError && <Alert type="warning" showIcon style={{ marginBottom: 24 }} message="Não foi possível carregar os participantes. O filtro por participante ficará indisponível." />}
            {section('upcoming', 'Próximas expedições')}
            <Divider dashed />
            {section('past', 'Expedições realizadas')}
        </div>
    )
}
