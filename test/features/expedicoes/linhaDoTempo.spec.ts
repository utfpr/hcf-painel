import moment from 'moment'
import {
  describe, expect, it
} from 'vitest'

import {
  camposDoCorpo,
  evidenciasDaResposta,
  filtrarEventos,
  formatarDataHora,
  nomeAutor,
  ordenarEventos,
  paginaEventosDaResposta,
  resumoDoEvento,
  resolverUrlEvidencia,
  textoOuTraco,
  type EventoLinha
} from '@/features/expedicoes/linhaDoTempo'

function evento(parcial: Partial<EventoLinha> & Pick<EventoLinha, 'id' | 'tipo' | 'capturadoEm'>): EventoLinha {
  return {
    observacoes: null,
    latitude: null,
    longitude: null,
    altitude: null,
    createdBy: null,
    coleta: null,
    arquivos: [],
    ...parcial
  }
}

describe('linha do tempo da expedição', () => {
  it('mostra traço no campo vazio', () => {
    expect(textoOuTraco(null)).toBe('-')
    expect(textoOuTraco('   ')).toBe('-')
    expect(textoOuTraco('Araucaria')).toBe('Araucaria')
  })

  it('formata a data e rejeita instante inválido', () => {
    const iso = '2026-01-15T15:45:00.000Z'
    expect(formatarDataHora(iso)).toBe(moment(iso).format('DD/MM/YYYY HH:mm'))
    expect(formatarDataHora('')).toBe('-')
    expect(formatarDataHora('nao-e-data')).toBe('-')
  })

  it('resolve o autor pelo participante e usa traço fora da lista', () => {
    const participantes = [
      { id: '7', nome: 'Maria Silva' },
      { id: 8, nome: '   ' }
    ]
    expect(nomeAutor(7, participantes)).toBe('Maria Silva')
    expect(nomeAutor(8, participantes)).toBe('-')
    expect(nomeAutor(9, participantes)).toBe('-')
    expect(nomeAutor(null, participantes)).toBe('-')
  })

  it('ordena do mais antigo para o mais novo e desempata pelo id', () => {
    const ordenados = ordenarEventos([
      evento({
        id: 3, tipo: 'DIARIO', capturadoEm: '2026-10-11T16:00:00.000Z'
      }),
      evento({
        id: 2, tipo: 'COLETA', capturadoEm: '2026-10-11T09:00:00.000Z'
      }),
      evento({
        id: 1, tipo: 'DIARIO', capturadoEm: '2026-10-11T09:00:00.000Z'
      })
    ])
    expect(ordenados.map(item => item.id)).toEqual([
      1,
      2,
      3
    ])
  })

  it('mantém quatro atributos no card fechado, um jogo para cada tipo', () => {
    const participantes = [{ id: 4, nome: 'João' }]
    const coleta = evento({
      id: 1,
      tipo: 'COLETA',
      capturadoEm: '2026-10-11T09:00:00.000Z',
      coleta: {
        familia: 'Arecaceae',
        nome_popular: null,
        nome_cientifico: 'Euterpe edulis',
        municipio: null,
        estado: null,
        referencia_local: null,
        tipo_vegetacao: null,
        solo: null,
        relevo: null,
        substrato: null,
        tronco_com_casca: null,
        associacoes: null,
        folhas: null,
        habito: null,
        frutos: null,
        flores: null,
        luminosidade: null
      }
    })
    const diario = evento({
      id: 2,
      tipo: 'DIARIO',
      capturadoEm: '2026-10-11T17:00:00.000Z',
      observacoes: 'Tempo nublado',
      createdBy: 4
    })

    expect(resumoDoEvento(coleta, participantes).map(item => item.rotulo)).toEqual([
      'Tipo',
      'Data',
      'Nome científico',
      'Nome popular'
    ])
    expect(resumoDoEvento(coleta, participantes)[3]?.valor).toBe('-')
    expect(resumoDoEvento(diario, participantes).map(item => item.valor)).toEqual([
      'Diário',
      formatarDataHora(diario.capturadoEm),
      'João',
      'Tempo nublado'
    ])
  })

  it('abre a ficha só na coleta e mantém o campo vazio visível', () => {
    const coleta = evento({
      id: 1,
      tipo: 'COLETA',
      capturadoEm: '2026-10-11T09:00:00.000Z',
      coleta: {
        familia: null,
        nome_popular: 'Palmito-juçara',
        nome_cientifico: 'Euterpe edulis',
        municipio: null,
        estado: null,
        referencia_local: null,
        tipo_vegetacao: null,
        solo: null,
        relevo: null,
        substrato: null,
        tronco_com_casca: null,
        associacoes: null,
        folhas: null,
        habito: null,
        frutos: null,
        flores: null,
        luminosidade: null
      }
    })
    const diario = evento({
      id: 2,
      tipo: 'DIARIO',
      capturadoEm: '2026-10-11T17:00:00.000Z',
      observacoes: null
    })
    const rotulosColeta = camposDoCorpo(coleta, []).map(item => item.rotulo)
    const rotulosDiario = camposDoCorpo(diario, []).map(item => item.rotulo)

    expect(rotulosColeta).toContain('Família')
    expect(rotulosColeta).toContain('Nome científico')
    expect(camposDoCorpo(coleta, []).find(item => item.rotulo === 'Família')?.valor).toBe('-')
    expect(rotulosDiario).not.toContain('Família')
    expect(rotulosDiario).toEqual([
      'Observações',
      'Latitude',
      'Longitude',
      'Altitude',
      'Autor'
    ])
  })

  it('filtra no cliente por tipo, texto, ficha, período e anexo', () => {
    const coleta = evento({
      id: 1,
      tipo: 'COLETA',
      capturadoEm: '2026-10-11T12:00:00.000Z',
      observacoes: 'Indivíduo adulto',
      coleta: {
        familia: 'Araucariaceae',
        nome_popular: 'Pinheiro-do-paraná',
        nome_cientifico: 'Araucaria angustifolia',
        municipio: null,
        estado: null,
        referencia_local: null,
        tipo_vegetacao: null,
        solo: null,
        relevo: null,
        substrato: null,
        tronco_com_casca: null,
        associacoes: null,
        folhas: null,
        habito: null,
        frutos: null,
        flores: null,
        luminosidade: null
      },
      arquivos: [
        {
          id: 9,
          nome: 'Folha',
          url: '/uploads/evidencias/folha.png',
          mimeType: 'image/png',
          tamanho: 10
        }
      ]
    })
    const diario = evento({
      id: 2,
      tipo: 'DIARIO',
      capturadoEm: '2026-10-12T12:00:00.000Z',
      observacoes: 'Solo úmido'
    })
    const eventos = [coleta, diario]

    expect(filtrarEventos(eventos, { tipo: 'DIARIO' }).map(item => item.id)).toEqual([2])
    expect(filtrarEventos(eventos, { texto: 'úmido' }).map(item => item.id)).toEqual([2])
    expect(filtrarEventos(eventos, { familia: 'araucaria' }).map(item => item.id)).toEqual([1])
    expect(filtrarEventos(eventos, { nomeCientifico: 'ilex' })).toEqual([])
    expect(filtrarEventos(eventos, { anexo: 'sem' }).map(item => item.id)).toEqual([2])
    expect(filtrarEventos(eventos, {
      de: Date.parse('2026-10-11T00:00:00.000Z'),
      ate: Date.parse('2026-10-11T23:59:59.999Z')
    }).map(item => item.id)).toEqual([1])
  })

  it('lê a página de eventos e ignora ficha em diário', () => {
    const pagina = paginaEventosDaResposta({
      total: 4,
      itens: [
        {
          id: 10,
          tipo: 'COLETA',
          capturado_em: '2026-10-11T09:30:00.000Z',
          observacoes: '  ',
          latitude: -24.04,
          created_by: '4',
          coleta: { familia: 'Araucariaceae', nome_cientifico: 'Araucaria angustifolia' }
        },
        {
          id: 11,
          tipo: 'DIARIO',
          capturado_em: '2026-10-11T16:00:00.000Z',
          coleta: { familia: 'Não deveria aparecer' }
        },
        { tipo: 'COLETA' }
      ]
    })

    expect(pagina.total).toBe(4)
    expect(pagina.itens).toHaveLength(2)
    expect(pagina.itens[0]).toMatchObject({
      id: 10,
      tipo: 'COLETA',
      observacoes: null,
      latitude: -24.04,
      createdBy: 4,
      coleta: {
        familia: 'Araucariaceae',
        nome_cientifico: 'Araucaria angustifolia',
        nome_popular: null
      }
    })
    expect(pagina.itens[1]?.coleta).toBeNull()
  })

  it('lê evidências e resolve a url contra a base da API', () => {
    expect(evidenciasDaResposta([
      {
        id: 3,
        nome: 'Áudio do diário',
        url: '/uploads/evidencias/diario.wav',
        mime_type: 'audio/wav',
        tamanho: 1200
      },
      { nome: 'sem id' }
    ])).toEqual([
      {
        id: 3,
        nome: 'Áudio do diário',
        url: '/uploads/evidencias/diario.wav',
        mimeType: 'audio/wav',
        tamanho: 1200
      }
    ])
    expect(resolverUrlEvidencia('/uploads/evidencias/diario.wav', 'http://localhost:3000/api'))
      .toBe('http://localhost:3000/uploads/evidencias/diario.wav')
    expect(resolverUrlEvidencia('https://cdn.exemplo/foto.png', 'http://localhost:3000/api'))
      .toBe('https://cdn.exemplo/foto.png')
  })
})
