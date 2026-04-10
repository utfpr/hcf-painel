import {
  useCallback, useEffect, useMemo, useRef, useState
} from 'react'

import { useForm } from 'react-hook-form'

import { useNotification } from '@/hooks/useNotification'

import { SubespecieService } from '../services/SubespecieService'
import type {
  AutorOption,
  EspecieOption,
  FamiliaOption,
  GeneroOption,
  ReinoOption,
  Subespecie,
  SubespecieFormValues
} from '../types'

export interface SubespecieFormViewModel {
  form: ReturnType<typeof useForm<SubespecieFormValues>>
  visibleModal: boolean
  modalTitle: string
  loadingModal: boolean
  editingId: number | string
  reinos: ReinoOption[]
  familias: FamiliaOption[]
  generos: GeneroOption[]
  especies: EspecieOption[]
  autores: AutorOption[]
  fetchingReinos: boolean
  fetchingFamilias: boolean
  fetchingGeneros: boolean
  fetchingEspecies: boolean
  fetchingAutores: boolean
  reinoSelecionado: number | string | null
  familiaSelecionada: number | string | null
  generoSelecionado: number | string | null
  openCreate: () => void
  openForEdit: (subespecie: Subespecie) => Promise<void>
  closeModal: () => void
  submitModal: () => Promise<void>
  loadReinos: (searchText: string) => Promise<void>
  loadFamilias: (searchText: string) => Promise<void>
  loadGeneros: (searchText: string) => Promise<void>
  loadEspecies: (searchText: string) => Promise<void>
  loadAutores: (searchText: string) => Promise<void>
  onReinoChange: (reinoId: number | string | undefined) => void
  onFamiliaChange: (familiaId: number | string | undefined) => void
  onGeneroChange: (generoId: number | string | undefined) => void
}

export interface UseSubespecieFormViewModelOptions {
  onSuccess: () => void | Promise<void>
}

export function useSubespecieFormViewModel(options: UseSubespecieFormViewModelOptions): SubespecieFormViewModel {
  const service = useMemo(() => SubespecieService.getInstance(), [])
  const { showNotification } = useNotification()
  const notifyRef = useRef(showNotification)
  notifyRef.current = showNotification
  const onSuccessRef = useRef(options.onSuccess)
  onSuccessRef.current = options.onSuccess

  const form = useForm<SubespecieFormValues>({
    defaultValues: {
      nomeSubespecie: '',
      reinoId: undefined,
      familiaId: undefined,
      generoId: undefined,
      especieId: undefined,
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
  const [especies, setEspecies] = useState<EspecieOption[]>([])
  const [autores, setAutores] = useState<AutorOption[]>([])
  const [fetchingReinos, setFetchingReinos] = useState(false)
  const [fetchingFamilias, setFetchingFamilias] = useState(false)
  const [fetchingGeneros, setFetchingGeneros] = useState(false)
  const [fetchingEspecies, setFetchingEspecies] = useState(false)
  const [fetchingAutores, setFetchingAutores] = useState(false)
  const [reinoSelecionado, setReinoSelecionado] = useState<number | string | null>(null)
  const [familiaSelecionada, setFamiliaSelecionada] = useState<number | string | null>(null)
  const [generoSelecionado, setGeneroSelecionado] = useState<number | string | null>(null)

  const loadReinos = useCallback(
    async (searchText: string) => {
      setFetchingReinos(true)
      try {
        setReinos(await service.listReinos(searchText?.trim() || undefined))
      } catch (error) {
        notifyRef.current({
          type: 'error',
          message: 'Erro',
          description: error instanceof Error ? error.message : 'Falha ao buscar reinos.'
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
        setFamilias(await service.listFamilias(reinoSelecionado, searchText?.trim() || undefined))
      } catch (error) {
        notifyRef.current({
          type: 'error',
          message: 'Erro',
          description: error instanceof Error ? error.message : 'Falha ao buscar famílias.'
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
        setGeneros(await service.listGeneros(familiaSelecionada, searchText?.trim() || undefined))
      } catch (error) {
        notifyRef.current({
          type: 'error',
          message: 'Erro',
          description: error instanceof Error ? error.message : 'Falha ao buscar gêneros.'
        })
        setGeneros([])
      } finally {
        setFetchingGeneros(false)
      }
    },
    [familiaSelecionada, service]
  )

  const loadEspecies = useCallback(
    async (searchText: string) => {
      if (!generoSelecionado) {
        setEspecies([])
        return
      }
      setFetchingEspecies(true)
      try {
        setEspecies(await service.listEspecies(generoSelecionado, searchText?.trim() || undefined))
      } catch (error) {
        notifyRef.current({
          type: 'error',
          message: 'Erro',
          description: error instanceof Error ? error.message : 'Falha ao buscar espécies.'
        })
        setEspecies([])
      } finally {
        setFetchingEspecies(false)
      }
    },
    [generoSelecionado, service]
  )

  const loadAutores = useCallback(
    async (searchText: string) => {
      setFetchingAutores(true)
      try {
        setAutores(await service.listAutores(searchText?.trim() || undefined))
      } catch (error) {
        notifyRef.current({
          type: 'error',
          message: 'Erro',
          description: error instanceof Error ? error.message : 'Falha ao buscar autores.'
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

  useEffect(() => {
    if (visibleModal && generoSelecionado) {
      void loadEspecies('')
    }
  }, [
    visibleModal,
    generoSelecionado,
    loadEspecies
  ])

  const onReinoChange = useCallback(
    (reinoId: number | string | undefined) => {
      setReinoSelecionado(reinoId ?? null)
      setFamiliaSelecionada(null)
      setGeneroSelecionado(null)
      setFamilias([])
      setGeneros([])
      setEspecies([])
      form.setValue('familiaId', undefined)
      form.setValue('generoId', undefined)
      form.setValue('especieId', undefined)
      if (reinoId) {
        void service.listFamilias(reinoId, undefined).then(setFamilias).catch(() => setFamilias([]))
      }
    },
    [form, service]
  )

  const onFamiliaChange = useCallback(
    (familiaId: number | string | undefined) => {
      setFamiliaSelecionada(familiaId ?? null)
      setGeneroSelecionado(null)
      setGeneros([])
      setEspecies([])
      form.setValue('generoId', undefined)
      form.setValue('especieId', undefined)
      if (familiaId) {
        void service.listGeneros(familiaId, undefined).then(setGeneros).catch(() => setGeneros([]))
      }
    },
    [form, service]
  )

  const onGeneroChange = useCallback(
    (generoId: number | string | undefined) => {
      setGeneroSelecionado(generoId ?? null)
      setEspecies([])
      form.setValue('especieId', undefined)
      if (generoId) {
        void service.listEspecies(generoId, undefined).then(setEspecies).catch(() => setEspecies([]))
      }
    },
    [form, service]
  )

  const openCreate = useCallback(() => {
    setModalTitle('Cadastrar')
    setEditingId(-1)
    setReinoSelecionado(null)
    setFamiliaSelecionada(null)
    setGeneroSelecionado(null)
    setFamilias([])
    setGeneros([])
    setEspecies([])
    form.reset({
      nomeSubespecie: '',
      reinoId: undefined,
      familiaId: undefined,
      generoId: undefined,
      especieId: undefined,
      autorId: undefined
    })
    setVisibleModal(true)
  }, [form])

  const openForEdit = useCallback(
    async (subespecie: Subespecie) => {
      setModalTitle('Atualizar')
      setEditingId(subespecie.id)
      const reinoId = subespecie.especie?.genero?.familia?.reino?.id ?? null
      const familiaId = subespecie.especie?.genero?.familia?.id ?? null
      const generoId = subespecie.especie?.genero?.id ?? null
      const especieId = subespecie.especie?.id ?? null
      const autorId = subespecie.autor?.id
      setReinoSelecionado(reinoId)
      setFamiliaSelecionada(familiaId)
      setGeneroSelecionado(generoId)
      form.reset({
        nomeSubespecie: subespecie.nome,
        reinoId: reinoId ?? undefined,
        familiaId: familiaId ?? undefined,
        generoId: generoId ?? undefined,
        especieId: especieId ?? undefined,
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
      if (generoId) {
        setFetchingEspecies(true)
        try {
          setEspecies(await service.listEspecies(generoId, undefined))
        } catch {
          setEspecies([])
        } finally {
          setFetchingEspecies(false)
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
    setGeneroSelecionado(null)
    setFamilias([])
    setGeneros([])
    setEspecies([])
    setEditingId(-1)
    form.reset({
      nomeSubespecie: '',
      reinoId: undefined,
      familiaId: undefined,
      generoId: undefined,
      especieId: undefined,
      autorId: undefined
    })
  }, [form])

  const submitModal = useCallback(async () => {
    const nome = form.getValues('nomeSubespecie')?.trim()
    const especieId = form.getValues('especieId')
    const autorId = form.getValues('autorId')

    if (!nome || !especieId) {
      notifyRef.current({
        type: 'warning',
        message: 'Falha',
        description: 'Informe o nome da nova subespécie e da espécie.'
      })
      return
    }

    setLoadingModal(true)
    try {
      if (editingId === -1) {
        await service.create(nome, especieId, autorId)
        notifyRef.current({
          type: 'success',
          message: 'Sucesso',
          description: 'O cadastro foi realizado com sucesso.'
        })
      } else {
        await service.update(editingId, nome, especieId, autorId)
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
    especies,
    autores,
    fetchingReinos,
    fetchingFamilias,
    fetchingGeneros,
    fetchingEspecies,
    fetchingAutores,
    reinoSelecionado,
    familiaSelecionada,
    generoSelecionado,
    openCreate,
    openForEdit,
    closeModal,
    submitModal,
    loadReinos,
    loadFamilias,
    loadGeneros,
    loadEspecies,
    loadAutores,
    onReinoChange,
    onFamiliaChange,
    onGeneroChange
  }
}
