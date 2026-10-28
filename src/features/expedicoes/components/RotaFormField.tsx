import {
  useEffect, useMemo, useRef, useState,
  type ReactNode
} from 'react'

import {
  Button, Checkbox, Col, Form, List, Select, Spin
} from 'antd'
import { useTranslation } from 'react-i18next'

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  RightOutlined
} from '@ant-design/icons'

import { useBuscaRemota } from '../hooks/useBuscaRemota'
import type {
  LocalColetaItem,
  ParadaRotaForm,
  SelectOption
} from '../types'

const ROTA_VAZIA: ParadaRotaForm[] = []

type CatalogoLocal = LocalColetaItem[] | 'loading' | 'error'

interface RotaSelectorProps {
  value?: ParadaRotaForm[]
  onChange?: (value: ParadaRotaForm[]) => void
  buscar: (termo: string) => Promise<SelectOption[]>
  buscarLocais: (cidadeId: number) => Promise<LocalColetaItem[]>
}

function useLocaisPorCidade(
  cidadeIds: number[],
  buscarLocais: (cidadeId: number) => Promise<LocalColetaItem[]>
) {
  const [catalogo, setCatalogo] = useState<Record<number, CatalogoLocal>>({})
  const pedidos = useRef(new Set<number>())

  useEffect(() => {
    const pendentes = cidadeIds.filter(id => !pedidos.current.has(id))
    if (pendentes.length === 0) return

    for (const cidadeId of pendentes) pedidos.current.add(cidadeId)
    setCatalogo(atual => {
      const proximo = { ...atual }
      for (const cidadeId of pendentes) proximo[cidadeId] = 'loading'
      return proximo
    })

    for (const cidadeId of pendentes) {
      void buscarLocais(cidadeId)
        .then(locais => {
          setCatalogo(atual => ({ ...atual, [cidadeId]: locais }))
        })
        .catch(() => {
          setCatalogo(atual => ({ ...atual, [cidadeId]: 'error' }))
        })
    }
  }, [cidadeIds, buscarLocais])

  return catalogo
}

interface LocaisDaCidadeProps {
  titulo: string
  acoes: ReactNode
  selecionados: number[]
  estado: CatalogoLocal | undefined
  onChange: (ids: number[]) => void
}

function LocaisDaCidade({
  titulo, acoes, selecionados, estado, onChange
}: LocaisDaCidadeProps) {
  const { t } = useTranslation('novaExpedicaoPage')
  const [aberto, setAberto] = useState(false)
  const carregando = estado === undefined || estado === 'loading'
  const temLocais = Array.isArray(estado) && estado.length > 0

  const tituloNode = temLocais
    ? (
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto(atual => !atual)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          width: 'fit-content',
          border: 'none',
          background: 'transparent',
          padding: 0,
          cursor: 'pointer',
          color: 'inherit',
          font: 'inherit',
          textAlign: 'left'
        }}
      >
        <RightOutlined
          style={{
            marginRight: 8,
            transition: 'transform 0.2s',
            transform: aberto ? 'rotate(90deg)' : 'rotate(0deg)'
          }}
        />
        <span>{titulo}</span>
      </button>
    )
    : (
      <span>
        {carregando && <Spin size="small" style={{ marginRight: 8 }} />}
        {titulo}
      </span>
    )

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8
        }}
      >
        <div style={{ minWidth: 0 }}>{tituloNode}</div>
        <div style={{
          display: 'flex', flex: 'none', gap: 8
        }}
        >
          {acoes}
        </div>
      </div>

      {estado === 'error' && (
        <div style={{ marginLeft: 22, color: 'rgba(0,0,0,0.45)' }}>
          {t('rota.erroLocais')}
        </div>
      )}

      {temLocais && aberto && (
        <div style={{ marginLeft: 22, marginTop: 4 }}>
          {estado.map(local => {
            const id = Number(local.id)
            if (!Number.isFinite(id)) return null
            const marcado = selecionados.some(item => Number(item) === id)
            return (
              <div key={id}>
                <Checkbox
                  checked={marcado}
                  onChange={event => {
                    const ids = selecionados
                      .map(item => Number(item))
                      .filter(item => Number.isFinite(item) && item !== id)
                    onChange(event.target.checked ? [...ids, id] : ids)
                  }}
                >
                  {local.descricao}
                </Checkbox>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RotaSelector({
  value = ROTA_VAZIA, onChange, buscar, buscarLocais
}: RotaSelectorProps) {
  const { t } = useTranslation(['novaExpedicaoPage', 'common'])
  const {
    options, loading, onSearch
  } = useBuscaRemota(buscar)
  const cidadeIds = useMemo(() => {
    const ids = value
      .map(parada => Number(parada.value))
      .filter(id => Number.isFinite(id))
    return [...new Set(ids)]
  }, [value])
  const catalogo = useLocaisPorCidade(cidadeIds, buscarLocais)

  const adicionar = (id: number | string) => {
    const opcao = options.find(item => String(item.value) === String(id))
    onChange?.([
      ...value,
      {
        value: id, label: opcao?.label ?? String(id), locaisColetaIds: []
      }
    ])
  }

  const mover = (index: number, deslocamento: -1 | 1) => {
    const destino = index + deslocamento
    if (destino < 0 || destino >= value.length) return

    const proxima = [...value]
    ;[proxima[index], proxima[destino]] = [proxima[destino], proxima[index]]
    onChange?.(proxima)
  }

  const remover = (index: number) => {
    onChange?.(value.filter((_, posicao) => posicao !== index))
  }

  const atualizarLocais = (index: number, ids: number[]) => {
    onChange?.(value.map((parada, posicao) => (
      posicao === index ? { ...parada, locaisColetaIds: ids } : parada
    )))
  }

  return (
    <>
      <Select<number | null>
        style={{ width: '100%' }}
        showSearch
        value={null}
        placeholder={t('novaExpedicaoPage:placeholders.rota')}
        options={options}
        loading={loading}
        onSearch={onSearch}
        onSelect={id => { if (id !== null) adicionar(id) }}
        filterOption={false}
        notFoundContent={loading
          ? <Spin size="small" />
          : t('common:nenhumResultadoEncontrado')}
      />

      {value.length > 0 && (
        <List
          size="small"
          bordered
          style={{ marginTop: 8 }}
          dataSource={value.map((parada, index) => ({ parada, index }))}
          renderItem={({ parada, index }) => {
            const cidadeId = Number(parada.value)
            return (
              <List.Item
                key={`${parada.value}-${index}`}
                style={{ alignItems: 'flex-start' }}
              >
                <LocaisDaCidade
                  titulo={`${index + 1}. ${parada.label}`}
                  acoes={(
                    <>
                      <Button
                        size="small"
                        icon={<ArrowUpOutlined />}
                        disabled={index === 0}
                        aria-label={t('novaExpedicaoPage:rota.subir')}
                        onClick={() => mover(index, -1)}
                      />
                      <Button
                        size="small"
                        icon={<ArrowDownOutlined />}
                        disabled={index === value.length - 1}
                        aria-label={t('novaExpedicaoPage:rota.descer')}
                        onClick={() => mover(index, 1)}
                      />
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        aria-label={t('novaExpedicaoPage:rota.remover')}
                        onClick={() => remover(index)}
                      />
                    </>
                  )}
                  selecionados={parada.locaisColetaIds ?? []}
                  estado={Number.isFinite(cidadeId) ? catalogo[cidadeId] : []}
                  onChange={ids => atualizarLocais(index, ids)}
                />
              </List.Item>
            )
          }}
        />
      )}
    </>
  )
}

interface RotaFormFieldProps {
  buscar: (termo: string) => Promise<SelectOption[]>
  buscarLocais: (cidadeId: number) => Promise<LocalColetaItem[]>
}

export function RotaFormField({ buscar, buscarLocais }: RotaFormFieldProps) {
  const { t } = useTranslation('novaExpedicaoPage')

  return (
    <>
      <Col span={24}>
        <span>{t('campos.rota')}</span>
      </Col>
      <Col span={24}>
        <Form.Item name="rotas">
          <RotaSelector buscar={buscar} buscarLocais={buscarLocais} />
        </Form.Item>
      </Col>
    </>
  )
}
