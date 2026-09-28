import { useCallback, useEffect, useRef, useState } from 'react'

import { Alert, Button, Card, Col, DatePicker, Divider, Empty, Form, Pagination, Row, Select, Spin, Tooltip } from 'antd'
import axios from 'axios'
import moment from 'moment'
import { Link } from 'react-router'

import { EditOutlined, InboxOutlined, ReloadOutlined } from '@ant-design/icons'

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
        order: 'data_inicio:desc'
    }

    if (filters.cidade_id) params.cidade_id = filters.cidade_id
    if (filters.usuario_id) params.usuario_id = filters.usuario_id
    if (filters.data_inicio_de) params.data_inicio_de = filters.data_inicio_de.format(API_DATE_FORMAT)
    if (filters.data_fim_ate) params.data_fim_ate = filters.data_fim_ate.format(API_DATE_FORMAT)

    // Realizadas: data_fim <= ontem. A API não filtra data_fim >= hoje.
    // Próximas não mandam início >= hoje, senão a expedição em curso some.
    if (category !== 'upcoming') {
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
        participantCount: Array.isArray(item.participantes) ? item.participantes.length : 0
    }
}

function ExpeditionCard({ item }) {
    return (
        <Card
            style={{ height: '100%' }}
            title={<Link to={`/expedicoes/detalhes/${encodeURIComponent(item.id)}`}>{`Expedição #${item.id}`}</Link>}
            actions={[
                <Button key="edit" type="text" icon={<EditOutlined />} disabled>Editar</Button>,
                <Tooltip key="archive" title="A API disponibiliza exclusão, mas ainda não oferece arquivamento.">
                    <Button type="text" icon={<InboxOutlined />} disabled>Arquivar</Button>
                </Tooltip>
            ]}
        >
            <p>
                <strong>Início:</strong>
                {' '}
                {moment.parseZone(item.startDate).format(DATE_FORMAT)}
            </p>
            {item.endDate && (
                <p>
                    <strong>Fim:</strong>
                    {' '}
                    {moment.parseZone(item.endDate).format(DATE_FORMAT)}
                </p>
            )}
            <p>
                <strong>Destino:</strong>
                {' '}
                {item.destination}
            </p>
            <p>
                <strong>Participantes:</strong>
                {' '}
                {item.participantCount}
            </p>
            <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{item.description || 'Sem descrição.'}</p>
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
