import {
  useCallback, useEffect, useMemo, useRef, useState
} from 'react'

import { useForm } from 'react-hook-form'

import { useNotification } from '@/hooks/useNotification'

import { EspecieService } from '../services/EspecieService'
import type {
  AutorOption,
  Especie,
  EspecieFormValues,
  FamiliaOption,
  GeneroOption,
  ReinoOption
} from '../types'

export interface EspecieFormViewModel {
  form: ReturnType<typeof useForm<EspecieFormValues>>
  visibleModal: boolean
  modalTitle: string
  loadingModal: boolean
  editingId: number | string
  reinos: ReinoOption[]
  familias: FamiliaOption[]
  generos: GeneroOption[]
  autores: AutorOption[]
  fetchingReinos: boolean
  fetchingFamilias: boolean
  fetchingGeneros: boolean
  fetchingAutores: boolean
  reinoSelecionado: number | string | null
  familiaSelecionada: number | string | null
  openCreate: () => void
  openForEdit: (especie: Especie) => Promise<void>
  closeModal: () => void
  submitModal: () => Promise<void>
  loadReinos: (searchText: string) => Promise<void>
  loadFamilias: (searchText: string) => Promise<void>
  loadGeneros: (searchText: string) => Promise<void>
  loadAutores: (searchText: string) => Promise<void>
  onReinoChange: (reinoId: number | string | undefined) => void
  onFamiliaChange: (familiaId: number | string | undefined) => void
}

export interface UseEspecieFormViewModelOptions {
  onSuccess: () => void | Promise<void>
}

export function useEspecieFormViewModel(options: UseEspecieFormViewModelOptions): EspecieFormViewModel {
  const service = useMemo(() => EspecieService.getInstance(), [])
  const { showNotification } = useNotification()
  const notifyRef = useRef(showNotification)
  notifyRef.current = showNotification
  const onSuccessRef = useRef(options.onSuccess)
  onSuccessRef.current = options.onSuccess

  const form = useForm<EspecieFormValues>({
    defaultValues: {
      nomeEspecie: '',
      reinoId: undefined,
      familiaId: undefined,
      generoId: undefined,
      autorId: undefined
    }
  })

  const [visibleModal, setVisibleModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('Cadastrar')
  const [loadingModal, setLoadingModal] = useState(false)
  const [editingId, setEditingId] = useState<number | string>(-1)
  const [reinos, setReinos] = useState<ReinoOption[]>([])
  const [familias, setFamilias] = useState<FamiliaOption[]>([])
  const [generos, setGeneros] = useState<GeneroOption[]>([])
  const [autores, setAutores] = useState<AutorOption[]>([])
  const [fetchingReinos, setFetchingReinos] = useState(false)
  const [fetchingFamilias, setFetchingFamilias] = useState(false)
  const [fetchingGeneros, setFetchingGeneros] = useState(false)
  const [fetchingAutores, setFetchingAutores] = useState(false)
  const [reinoSelecionado, setReinoSelecionado] = useState<number | string | null>(null)
  const [familiaSelecionada, setFamiliaSelecionada] = useState<number | string | null>(null)

  const loadReinos = useCallback(
    async (searchText: string) => {
      setFetchingReinos(true)
      try {
        const list = await service.listReinos(searchText?.trim() || undefined)
        setReinos(list)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao buscar reinos.'
        notifyRef.current({
          type: 'error', message: 'Erro', description: message
        })
        setReinos([])
      } finally {
        setFetchingReinos(false)
      }
    },
    [service]
  )

  const loadFamilias = useCallback(
    async (searchText: string) => {
      if (!reinoSelecionado) {
        setFamilias([])
        return
      }
      setFetchingFamilias(true)
      try {
        const list = await service.listFamilias(reinoSelecionado, searchText?.trim() || undefined)
        setFamilias(list)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao buscar famílias.'
        notifyRef.current({
          type: 'error', message: 'Erro', description: message
        })
        setFamilias([])
      } finally {
        setFetchingFamilias(false)
      }
    },
    [reinoSelecionado, service]
  )

  const loadGeneros = useCallback(
    async (searchText: string) => {
      if (!familiaSelecionada) {
        setGeneros([])
        return
      }
      setFetchingGeneros(true)
      try {
        const list = await service.listGeneros(familiaSelecionada, searchText?.trim() || undefined)
        setGeneros(list)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao buscar gêneros.'
        notifyRef.current({
          type: 'error', message: 'Erro', description: message
        })
        setGeneros([])
      } finally {
        setFetchingGeneros(false)
      }
    },
    [familiaSelecionada, service]
  )

  const loadAutores = useCallback(
    async (searchText: string) => {
      setFetchingAutores(true)
      try {
        const list = await service.listAutores(searchText?.trim() || undefined)
        setAutores(list)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao buscar autores.'
        notifyRef.current({
          type: 'error', message: 'Erro', description: message
        })
        setAutores([])
      } finally {
        setFetchingAutores(false)
      }
    },
    [service]
  )

  useEffect(() => {
    if (visibleModal) {
      void loadReinos('')
      void loadAutores('')
    }
  }, [
    visibleModal,
    loadReinos,
    loadAutores
  ])

  useEffect(() => {
    if (visibleModal && reinoSelecionado) {
      void loadFamilias('')
    }
  }, [
    visibleModal,
    reinoSelecionado,
    loadFamilias
  ])

  useEffect(() => {
    if (visibleModal && familiaSelecionada) {
      void loadGeneros('')
    }
  }, [
    visibleModal,
    familiaSelecionada,
    loadGeneros
  ])

  const onReinoChange = useCallback(
    (reinoId: number | string | undefined) => {
      setReinoSelecionado(reinoId ?? null)
      setFamiliaSelecionada(null)
      setFamilias([])
      setGeneros([])
      form.setValue('familiaId', undefined)
      form.setValue('generoId', undefined)
      if (reinoId) {
        void service.listFamilias(reinoId, undefined).then(setFamilias).catch(() => setFamilias([]))
      }
    },
    [form, service]
  )

  const onFamiliaChange = useCallback(
    (familiaId: number | string | undefined) => {
      setFamiliaSelecionada(familiaId ?? null)
      setGeneros([])
      form.setValue('generoId', undefined)
      if (familiaId) {
        void service.listGeneros(familiaId, undefined).then(setGeneros).catch(() => setGeneros([]))
      }
    },
    [form, service]
  )

  const openCreate = useCallback(() => {
    setModalTitle('Cadastrar')
    setEditingId(-1)
    setReinoSelecionado(null)
    setFamiliaSelecionada(null)
    setFamilias([])
    setGeneros([])
    form.reset({
      nomeEspecie: '',
      reinoId: undefined,
      familiaId: undefined,
      generoId: undefined,
      autorId: undefined
    })
    setVisibleModal(true)
  }, [form])

  const openForEdit = useCallback(
    async (especie: Especie) => {
      setModalTitle('Atualizar')
      setEditingId(especie.id)
      const reinoId = especie.genero?.familia?.reino?.id ?? null
      const familiaId = especie.genero?.familia?.id ?? null
      const generoId = especie.genero?.id ?? null
      const autorId = especie.autor?.id
      setReinoSelecionado(reinoId)
      setFamiliaSelecionada(familiaId)
      form.reset({
        nomeEspecie: especie.nome,
        reinoId: reinoId ?? undefined,
        familiaId: familiaId ?? undefined,
        generoId: generoId ?? undefined,
        autorId: autorId ?? undefined
      })
      setVisibleModal(true)
      await loadReinos('')
      await loadAutores('')
      if (reinoId) {
        setFetchingFamilias(true)
        try {
          setFamilias(await service.listFamilias(reinoId, undefined))
        } catch {
          setFamilias([])
        } finally {
          setFetchingFamilias(false)
        }
      }
      if (familiaId) {
        setFetchingGeneros(true)
        try {
          setGeneros(await service.listGeneros(familiaId, undefined))
        } catch {
          setGeneros([])
        } finally {
          setFetchingGeneros(false)
        }
      }
    },
    [
      form,
      loadAutores,
      loadReinos,
      service
    ]
  )

  const closeModal = useCallback(() => {
    setVisibleModal(false)
    setReinoSelecionado(null)
    setFamiliaSelecionada(null)
    setFamilias([])
    setGeneros([])
    setEditingId(-1)
    form.reset({
      nomeEspecie: '',
      reinoId: undefined,
      familiaId: undefined,
      generoId: undefined,
      autorId: undefined
    })
  }, [form])

  const submitModal = useCallback(async () => {
    const nome = form.getValues('nomeEspecie')?.trim()
    const generoId = form.getValues('generoId')
    const autorId = form.getValues('autorId')

    if (!nome || !generoId) {
      notifyRef.current({
        type: 'warning',
        message: 'Falha',
        description: 'Informe o nome da nova espécie e do gênero.'
      })
      return
    }

    setLoadingModal(true)
    try {
      if (editingId === -1) {
        await service.create(nome, generoId, autorId)
        notifyRef.current({
          type: 'success',
          message: 'Sucesso',
          description: 'O cadastro foi realizado com sucesso.'
        })
      } else {
        await service.update(editingId, nome, generoId, autorId)
        notifyRef.current({
          type: 'success',
          message: 'Sucesso',
          description: 'A atualização foi realizada com sucesso.'
        })
      }
      closeModal()
      await onSuccessRef.current()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Operação falhou.'
      notifyRef.current({
        type: 'error',
        message: 'Falha',
        description: message
      })
    } finally {
      setLoadingModal(false)
    }
  }, [
    closeModal,
    editingId,
    form,
    service
  ])

  return {
    form,
    visibleModal,
    modalTitle,
    loadingModal,
    editingId,
    reinos,
    familias,
    generos,
    autores,
    fetchingReinos,
    fetchingFamilias,
    fetchingGeneros,
    fetchingAutores,
    reinoSelecionado,
    familiaSelecionada,
    openCreate,
    openForEdit,
    closeModal,
    submitModal,
    loadReinos,
    loadFamilias,
    loadGeneros,
    loadAutores,
    onReinoChange,
    onFamiliaChange
  }
}
