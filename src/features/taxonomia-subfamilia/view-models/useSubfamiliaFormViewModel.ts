import {
  useCallback, useEffect, useMemo, useRef, useState
} from 'react'

import { useForm } from 'react-hook-form'

import { useNotification } from '@/hooks/useNotification'

import { SubfamiliaService } from '../services/SubfamiliaService'
import type {
  FamiliaOption, Subfamilia, SubfamiliaFormValues, ReinoOption
} from '../types'

export interface SubfamiliaFormViewModel {
  form: ReturnType<typeof useForm<SubfamiliaFormValues>>
  visibleModal: boolean
  modalTitle: string
  loadingModal: boolean
  editingId: number | string
  reinos: ReinoOption[]
  familias: FamiliaOption[]
  fetchingReinos: boolean
  fetchingFamilias: boolean
  reinoSelecionado: number | string | null
  openCreate: () => void
  openForEdit: (subfamilia: Subfamilia) => Promise<void>
  closeModal: () => void
  submitModal: () => Promise<void>
  loadReinos: (searchText: string) => Promise<void>
  loadFamilias: (searchText: string) => Promise<void>
  onReinoChange: (reinoId: number | string | undefined) => void
}

export interface UseSubfamiliaFormViewModelOptions {
  onSuccess: () => void | Promise<void>
}

export function useSubfamiliaFormViewModel(options: UseSubfamiliaFormViewModelOptions): SubfamiliaFormViewModel {
  const service = useMemo(() => SubfamiliaService.getInstance(), [])
  const { showNotification } = useNotification()
  const notifyRef = useRef(showNotification)
  notifyRef.current = showNotification
  const onSuccessRef = useRef(options.onSuccess)
  onSuccessRef.current = options.onSuccess

  const form = useForm<SubfamiliaFormValues>({
    defaultValues: {
      nomeSubfamilia: '',
      reinoId: undefined,
      familiaId: undefined
    }
  })

  const [visibleModal, setVisibleModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('Cadastrar')
  const [loadingModal, setLoadingModal] = useState(false)
  const [editingId, setEditingId] = useState<number | string>(-1)
  const [reinos, setReinos] = useState<ReinoOption[]>([])
  const [familias, setFamilias] = useState<FamiliaOption[]>([])
  const [fetchingReinos, setFetchingReinos] = useState(false)
  const [fetchingFamilias, setFetchingFamilias] = useState(false)
  const [reinoSelecionado, setReinoSelecionado] = useState<number | string | null>(null)

  const loadReinos = useCallback(
    async (searchText: string) => {
      setFetchingReinos(true)
      try {
        const list = await service.listReinos(searchText?.trim() || undefined)
        setReinos(list)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao buscar reinos.'
        notifyRef.current({
          type: 'error',
          message: 'Erro',
          description: message
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
          type: 'error',
          message: 'Erro',
          description: message
        })
        setFamilias([])
      } finally {
        setFetchingFamilias(false)
      }
    },
    [reinoSelecionado, service]
  )

  useEffect(() => {
    if (visibleModal) {
      void loadReinos('')
    }
  }, [visibleModal, loadReinos])

  useEffect(() => {
    if (visibleModal && reinoSelecionado) {
      void loadFamilias('')
    }
  }, [
    visibleModal,
    reinoSelecionado,
    loadFamilias
  ])

  const onReinoChange = useCallback(
    (reinoId: number | string | undefined) => {
      setReinoSelecionado(reinoId ?? null)
      form.setValue('familiaId', undefined)
      setFamilias([])
      if (reinoId) {
        void service.listFamilias(reinoId, undefined).then(setFamilias).catch(() => setFamilias([]))
      }
    },
    [form, service]
  )

  const openCreate = useCallback(() => {
    setModalTitle('Cadastrar')
    setEditingId(-1)
    setReinoSelecionado(null)
    setFamilias([])
    form.reset({
      nomeSubfamilia: '',
      reinoId: undefined,
      familiaId: undefined
    })
    setVisibleModal(true)
  }, [form])

  const openForEdit = useCallback(
    async (subfamilia: Subfamilia) => {
      setModalTitle('Atualizar')
      setEditingId(subfamilia.id)
      const reinoId = subfamilia.familia?.reino?.id ?? null
      const familiaId = subfamilia.familia?.id
      setReinoSelecionado(reinoId)
      form.reset({
        nomeSubfamilia: subfamilia.nome,
        reinoId: reinoId ?? undefined,
        familiaId: familiaId ?? undefined
      })
      setVisibleModal(true)
      await loadReinos('')
      if (reinoId) {
        setFetchingFamilias(true)
        try {
          const list = await service.listFamilias(reinoId, undefined)
          setFamilias(list)
        } catch {
          setFamilias([])
        } finally {
          setFetchingFamilias(false)
        }
      }
    },
    [
      form,
      loadReinos,
      service
    ]
  )

  const closeModal = useCallback(() => {
    setVisibleModal(false)
    setReinoSelecionado(null)
    setFamilias([])
    setEditingId(-1)
    form.reset({
      nomeSubfamilia: '',
      reinoId: undefined,
      familiaId: undefined
    })
  }, [form])

  const submitModal = useCallback(async () => {
    const nome = form.getValues('nomeSubfamilia')?.trim()
    const familiaId = form.getValues('familiaId')

    if (!nome || !familiaId) {
      notifyRef.current({
        type: 'warning',
        message: 'Falha',
        description: 'Informe o nome da nova subfamília e da família.'
      })
      return
    }

    setLoadingModal(true)
    try {
      if (editingId === -1) {
        await service.create(nome, familiaId)
        notifyRef.current({
          type: 'success',
          message: 'Sucesso',
          description: 'O cadastro foi realizado com sucesso.'
        })
      } else {
        await service.update(editingId, nome, familiaId)
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
    fetchingReinos,
    fetchingFamilias,
    reinoSelecionado,
    openCreate,
    openForEdit,
    closeModal,
    submitModal,
    loadReinos,
    loadFamilias,
    onReinoChange
  }
}
