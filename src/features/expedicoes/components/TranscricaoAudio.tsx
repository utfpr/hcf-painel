import {
  useEffect, useRef, useState
} from 'react'

import {
  Alert, Button, Collapse, Input, Modal, Space, Spin, Typography
} from 'antd'
import axios from 'axios'

import type { ArquivoEvento } from '../linhaDoTempo'

interface Transcricao {
  evidencia_id: number
  status: 'processando' | 'concluida' | 'erro'
  texto_original: string | null
  texto_revisado: string | null
  versao: number
  gerado_por_nome: string | null
  gerado_em: string | null
  revisado_por_nome: string | null
  revisado_em: string | null
  processamento_expira_em: string | null
}

interface ErroResposta {
  error?: {
    message?: string
    type?: string
  }
}

interface TranscricaoAudioProps {
  arquivo: ArquivoEvento
  podeEditar: boolean
}

function mensagem(error: unknown): string {
  if (axios.isAxiosError<ErroResposta>(error)) {
    return error.response?.data?.error?.message ?? 'Não foi possível acessar a transcrição. Tente novamente.'
  }
  return 'Não foi possível acessar a transcrição. Tente novamente.'
}

function dataAutor(data: string | null, nome: string | null): string {
  return [nome, data ? new Date(data).toLocaleString('pt-BR') : null].filter(Boolean).join(' — ')
}

export function TranscricaoAudio({ arquivo, podeEditar }: TranscricaoAudioProps) {
  const [aberto, setAberto] = useState(false)
  const [transcricao, setTranscricao] = useState<Transcricao | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  const [rascunho, setRascunho] = useState('')
  const [conflito, setConflito] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [tentativa, setTentativa] = useState(0)
  const [concluida, setConcluida] = useState(arquivo.transcricao?.status === 'concluida')
  const mounted = useRef(true)
  const endpoint = `/v1/evidencias/${arquivo.id}/transcricao`

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!aberto) return undefined
    let ativo = true
    let timer: ReturnType<typeof setTimeout> | undefined
    setErro(null)
    setOcupado(true)

    function atualizar(value: Transcricao | null) {
      if (!ativo) return
      setTranscricao(value)
      setConcluida(value?.status === 'concluida')
      setOcupado(false)
      if (value?.status === 'processando') {
        const expira = value.processamento_expira_em ? Date.parse(value.processamento_expira_em) : 0
        if (expira > Date.now()) timer = setTimeout(() => {
          void consultar()
        }, 3000)
        else setErro('A tentativa anterior expirou. Você pode tentar novamente.')
      }
      if (value?.status === 'erro') setErro('A tentativa anterior não foi concluída. Você pode tentar novamente.')
    }

    async function consultar() {
      try {
        const response = await axios.get<Transcricao | null>(endpoint)
        atualizar(response.data)
      } catch (error) {
        if (ativo) {
          setErro(mensagem(error))
          setOcupado(false)
        }
      }
    }

    async function iniciar() {
      try {
        const response = await axios.get<Transcricao | null>(endpoint)
        if (!ativo) return
        const value = response.data
        if (podeEditar && (!value || value.status === 'erro'
            || (value.status === 'processando' && Date.parse(value.processamento_expira_em ?? '') <= Date.now()))) {
          try {
            const generated = await axios.post<Transcricao>(endpoint, undefined, { timeout: 90000 })
            atualizar(generated.data)
          } catch (error) {
            if (!ativo) return
            if (axios.isAxiosError<ErroResposta>(error) && error.response?.data?.error?.type === 'transcricao_em_processamento') {
              await consultar()
            } else {
              setErro(mensagem(error))
              setOcupado(false)
            }
          }
        } else atualizar(value)
      } catch (error) {
        if (ativo) {
          setErro(mensagem(error))
          setOcupado(false)
        }
      }
    }
    void iniciar()
    return () => {
      ativo = false
      if (timer) clearTimeout(timer)
    }
  }, [
    aberto,
    endpoint,
    podeEditar,
    tentativa
  ])

  async function salvar() {
    if (!transcricao || ocupado || conflito) return
    setOcupado(true)
    setErro(null)
    try {
      const response = await axios.patch<Transcricao>(endpoint, { texto_revisado: rascunho, versao: transcricao.versao })
      if (!mounted.current) return
      setTranscricao(response.data)
      setEditando(false)
    } catch (error) {
      if (!mounted.current) return
      setErro(mensagem(error))
      if (axios.isAxiosError<ErroResposta>(error) && error.response?.data?.error?.type === 'versao_conflitante') setConflito(true)
    } finally {
      if (mounted.current) setOcupado(false)
    }
  }

  async function recarregar() {
    setOcupado(true)
    try {
      const response = await axios.get<Transcricao | null>(endpoint)
      if (!mounted.current) return
      setTranscricao(response.data)
      setConflito(false)
      setErro('Versão atual carregada. Seu texto foi preservado. Revise antes de salvar novamente.')
    } catch (error) {
      if (mounted.current) setErro(mensagem(error))
    } finally {
      if (mounted.current) setOcupado(false)
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(transcricao?.texto_revisado ?? transcricao?.texto_original ?? '')
      if (mounted.current) setCopiado(true)
    } catch {
      if (mounted.current) setErro('Não foi possível copiar. Selecione o texto para copiá-lo manualmente.')
    }
  }

  const processando = transcricao?.status === 'processando'
      && Date.parse(transcricao.processamento_expira_em ?? '') > Date.now()
  const podeConsultar = concluida || (arquivo.transcricao !== null && arquivo.transcricao !== undefined) || transcricao !== null
  if (!podeEditar && !podeConsultar) return null

  return (
    <>
      <Button
        size="small"
        onClick={() => {
          setEditando(false)
          setConflito(false)
          setCopiado(false)
          setAberto(true)
        }}
      >
        {concluida ? 'Ver transcrição' : podeEditar ? 'Transcrever' : 'Ver transcrição'}
      </Button>
      <Modal
        title={`Transcrição — ${arquivo.nome}`}
        open={aberto}
        onCancel={() => setAberto(false)}
        footer={<Button onClick={() => setAberto(false)}>Fechar</Button>}
        width={720}
        destroyOnClose
      >
        <audio
          controls
          preload="none"
          src={arquivo.url}
          style={{ width: '100%', marginBottom: 16 }}
          aria-label={arquivo.nome}
        />
        {(ocupado || processando) && (
          <div role="status">
            <Spin size="small" />
            {' '}
            {editando ? 'Salvando…' : 'Transcrevendo…'}
          </div>
        )}
        {erro && (
          <Alert
            type="warning"
            showIcon
            message={erro}
            style={{ marginBottom: 12 }}
          />
        )}
        {transcricao?.status === 'concluida' && (
          <>
            <Typography.Paragraph type="secondary">
              Gerada por
              {' '}
              {dataAutor(transcricao.gerado_em, transcricao.gerado_por_nome)}
            </Typography.Paragraph>
            {transcricao.revisado_em && (
              <Typography.Paragraph type="secondary">
                Última correção:
                {' '}
                {dataAutor(transcricao.revisado_em, transcricao.revisado_por_nome)}
              </Typography.Paragraph>
            )}
            {editando
              ? <Input.TextArea aria-label="Texto revisado" value={rascunho} onChange={event => setRascunho(event.target.value)} rows={8} disabled={ocupado} />
              : (
                <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                  {transcricao.texto_revisado ?? transcricao.texto_original}
                </Typography.Paragraph>
              )}
            <Space
              wrap
              style={{ margin: '12px 0' }}
            >
              {!editando && (
                <Button onClick={() => {
                  void copiar()
                }}
                >
                  {copiado ? 'Copiado' : 'Copiar'}
                </Button>
              )}
              {!editando && podeEditar && (
                <Button onClick={() => {
                  setRascunho(transcricao.texto_revisado ?? transcricao.texto_original ?? '')
                  setEditando(true)
                  setErro(null)
                  setConflito(false)
                }}
                >
                  Editar
                </Button>
              )}
              {editando && (
                <Button
                  aria-label="Salvar correção"
                  type="primary"
                  loading={ocupado}
                  disabled={!rascunho.trim() || conflito}
                  onClick={() => {
                    void salvar()
                  }}
                >
                  Salvar correção
                </Button>
              )}
              {editando && (
                <Button
                  disabled={ocupado}
                  onClick={() => {
                    setEditando(false)
                    setConflito(false)
                    setErro(null)
                  }}
                >
                  Cancelar edição
                </Button>
              )}
              {conflito && (
                <Button
                  loading={ocupado}
                  onClick={() => {
                    void recarregar()
                  }}
                >
                  Recarregar versão atual
                </Button>
              )}
            </Space>
            {transcricao.texto_revisado !== null && (
              <Collapse>
                <Collapse.Panel header="Texto original" key="original">
                  <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                    {transcricao.texto_original}
                  </Typography.Paragraph>
                </Collapse.Panel>
              </Collapse>
            )}
          </>
        )}
        {!ocupado && !processando && transcricao?.status !== 'concluida' && podeEditar && (
          <Button onClick={() => setTentativa(value => value + 1)}>Tentar novamente</Button>
        )}
        {!ocupado && !transcricao && !podeEditar && <Typography.Paragraph>Este áudio ainda não possui transcrição.</Typography.Paragraph>}
      </Modal>
    </>
  )
}
