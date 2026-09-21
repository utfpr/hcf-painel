import {
  useCallback, useEffect, useMemo, useRef, useState
} from 'react'

import debounce from 'lodash.debounce'

import type { SelectOption } from '../types'

const DEBOUNCE_DELAY = 300

/**
 * Busca remota com debounce para <Select showSearch>.
 *
 * Guarda as opções já selecionadas (`fixas`) para que os rótulos não sumam
 * quando uma nova busca substitui a lista — problema clássico dos selects
 * remotos com seleção múltipla.
 */
export function useBuscaRemota(
  buscar: (termo: string) => Promise<SelectOption[]>
) {
  const [options, setOptions] = useState<SelectOption[]>([])
  const [loading, setLoading] = useState(false)
  const [fixas, setFixas] = useState<SelectOption[]>([])
  const requestId = useRef(0)

  const executar = useCallback(async (termo: string) => {
    const id = ++requestId.current
    setLoading(true)
    try {
      const resultado = await buscar(termo)
      // Descarta respostas fora de ordem
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

  // Carga inicial + cancelamento do debounce ao desmontar
  useEffect(() => {
    void executar('')
    return () => { buscarComDebounce.cancel() }
  }, [executar, buscarComDebounce])

  /** Registra as opções escolhidas para preservar seus rótulos. */
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
