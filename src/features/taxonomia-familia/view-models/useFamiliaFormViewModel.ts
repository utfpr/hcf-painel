import {
  useCallback, useEffect, useMemo, useRef, useState
} from 'react'

import { useForm } from 'react-hook-form'

import { useNotification } from '@/hooks/useNotification'

import { FamiliaService } from '../services/FamiliaService'
import type {
  Familia, FamiliaFormValues, ReinoOption
} from '../types'

export interface FamiliaFormViewModel {
  form: ReturnType<typeof useForm<FamiliaFormValues>>
  visibleModal: boolean
  modalTitle: string
  loadingModal: boolean
  editingId: number | string
  reinos: ReinoOption[]
  fetchingReinos: boolean
  openCreate: () => void
  openForEdit: (familia: Familia) => void
  closeModal: () => void
  submitModal: () => Promise<void>
  loadReinos: (searchText: string) => Promise<void>
}

export interface UseFamiliaFormViewModelOptions {
  onSuccess: () => void | Promise<void>
}

export function useFamiliaFormViewModel(options: UseFamiliaFormViewModelOptions): FamiliaFormViewModel {
  const service = useMemo(() => FamiliaService.getInstance(), [])
  const { showNotification } = useNotification()
  const notifyRef = useRef(showNotification)
  notifyRef.current = showNotification
  const onSuccessRef = useRef(options.onSuccess)
  onSuccessRef.current = options.onSuccess

  const form = useForm<FamiliaFormValues>({
    defaultValues: { nome: '', reinoId: undefined }
  })

  const [visibleModal, setVisibleModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('Cadastrar')
  const [loadingModal, setLoadingModal] = useState(false)
  const [editingId, setEditingId] = useState<number | string>(-1)
  const [reinos, setReinos] = useState<ReinoOption[]>([])
  const [fetchingReinos, setFetchingReinos] = useState(false)

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

  useEffect(() => {
    if (visibleModal) {
      void loadReinos('')
    }
  }, [visibleModal, loadReinos])

  const openCreate = useCallback(() => {
    setModalTitle('Cadastrar')
    setEditingId(-1)
    form.reset({ nome: '', reinoId: undefined })
    setVisibleModal(true)
  }, [form])

  const openForEdit = useCallback(
    (familia: Familia) => {
      setModalTitle('Atualizar')
      setEditingId(familia.id)
      form.reset({
        nome: familia.nome,
        reinoId: familia.reino?.id
      })
      setVisibleModal(true)
    },
    [form]
  )

  const closeModal = useCallback(() => {
    setVisibleModal(false)
    form.reset({ nome: '', reinoId: undefined })
    setEditingId(-1)
  }, [form])

  const submitModal = useCallback(async () => {
    const nome = form.getValues('nome')?.trim()
    if (!nome) {
      notifyRef.current({
        type: 'warning',
        message: 'Falha',
        description: 'Informe o nome da família.'
      })
      return
    }

    const reinoId = form.getValues('reinoId')

    setLoadingModal(true)
    try {
      if (editingId === -1) {
        if (reinoId === undefined || reinoId === null || reinoId === '') {
          notifyRef.current({
            type: 'warning',
            message: 'Falha',
            description: 'Selecione um reino.'
          })
          setLoadingModal(false)
          return
        }
        await service.create(nome, reinoId)
        notifyRef.current({
          type: 'success',
          message: 'Sucesso',
          description: 'O cadastro foi realizado com sucesso.'
        })
      } else {
        await service.update(editingId, nome)
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
    fetchingReinos,
    openCreate,
    openForEdit,
    closeModal,
    submitModal,
    loadReinos
  }
}
