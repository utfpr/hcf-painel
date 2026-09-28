import {
  useCallback, useEffect, useMemo, useRef, useState
} from 'react'

import debounce from 'lodash.debounce'

import type { SelectOption } from '../types'

const DEBOUNCE_DELAY = 300

/**
 * Igual ao `useBuscaRemota`, mas aceita opções iniciais (ex.: valores já
 * salvos), para que o <Select> mostre o rótulo e não o id na tela de edição.
 */
export function useBuscaRemotaComIniciais(
  buscar: (termo: string) => Promise<SelectOption[]>,
  iniciais: SelectOption[]
) {
  const [options, setOptions] = useState<SelectOption[]>([])
  const [loading, setLoading] = useState(false)
  const [fixas, setFixas] = useState<SelectOption[]>(iniciais)
  const requestId = useRef(0)

  // Quando as iniciais chegam (carregamento assíncrono), passam a ser fixas.
  useEffect(() => {
    setFixas(anteriores => {
      const mapa = new Map<number, SelectOption>()
      for (const opcao of [...iniciais, ...anteriores]) mapa.set(opcao.value, opcao)
      return [...mapa.values()]
    })
  }, [iniciais])

  const executar = useCallback(async (termo: string) => {
    const id = ++requestId.current
    setLoading(true)
    try {
      const resultado = await buscar(termo)
      if (id !== requestId.current) return
      setOptions(resultado)
    } catch (error) {
      if (id !== requestId.current) return
      console.error(error)
      setOptions([])
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [buscar])

  const buscarComDebounce = useMemo(
    () => debounce((termo: string) => { void executar(termo) }, DEBOUNCE_DELAY),
    [executar]
  )

  useEffect(() => {
    void executar('')
    return () => { buscarComDebounce.cancel() }
  }, [executar, buscarComDebounce])

  const fixarSelecionadas = useCallback((valores: number[]) => {
    setFixas(anteriores => {
      const catalogo = [...anteriores, ...options]
      return valores
        .map(valor => catalogo.find(opcao => opcao.value === valor))
        .filter((opcao): opcao is SelectOption => Boolean(opcao))
    })
  }, [options])

  const optionsVisiveis = useMemo(() => {
    const mapa = new Map<number, SelectOption>()
    for (const opcao of [...fixas, ...options]) mapa.set(opcao.value, opcao)
    return [...mapa.values()]
  }, [fixas, options])

  return {
    options: optionsVisiveis,
    loading,
    onSearch: buscarComDebounce,
    fixarSelecionadas
  }
}
