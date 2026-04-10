import {
  useCallback, useMemo, useRef, useState
} from 'react'

import { useForm } from 'react-hook-form'

import { useNotification } from '@/hooks/useNotification'

import { ReinoService } from '../services/ReinoService'
import type { Reino, ReinoFormValues } from '../types'

export interface ReinoFormViewModel {
  form: ReturnType<typeof useForm<ReinoFormValues>>
  visibleModal: boolean
  modalTitle: string
  loadingModal: boolean
  editingId: number | string
  openCreate: () => void
  openForEdit: (reino: Reino) => void
  closeModal: () => void
  submitModal: () => Promise<void>
}

export interface UseReinoFormViewModelOptions {
  onSuccess: () => void | Promise<void>
}

export function useReinoFormViewModel(options: UseReinoFormViewModelOptions): ReinoFormViewModel {
  const service = useMemo(() => ReinoService.getInstance(), [])
  const { showNotification } = useNotification()
  const notifyRef = useRef(showNotification)
  notifyRef.current = showNotification
  const onSuccessRef = useRef(options.onSuccess)
  onSuccessRef.current = options.onSuccess

  const form = useForm<ReinoFormValues>({
    defaultValues: { reinoName: '' }
  })

  const [visibleModal, setVisibleModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('Cadastrar')
  const [loadingModal, setLoadingModal] = useState(false)
  const [editingId, setEditingId] = useState<number | string>(-1)

  const openCreate = useCallback(() => {
    setModalTitle('Cadastrar')
    setEditingId(-1)
    form.reset({ reinoName: '' })
    setVisibleModal(true)
  }, [form])

  const openForEdit = useCallback(
    (reino: Reino) => {
      setModalTitle('Atualizar')
      setEditingId(reino.id)
      form.reset({ reinoName: reino.nome })
      setVisibleModal(true)
    },
    [form]
  )

  const closeModal = useCallback(() => {
    setVisibleModal(false)
    form.reset({ reinoName: '' })
    setEditingId(-1)
  }, [form])

  const submitModal = useCallback(async () => {
    const name = form.getValues('reinoName')?.trim()
    if (!name) {
      notifyRef.current({
        type: 'warning',
        message: 'Falha',
        description: 'Informe o nome do reino.'
      })
      return
    }

    setLoadingModal(true)
    try {
      if (editingId === -1) {
        await service.create(name)
        notifyRef.current({
          type: 'success',
          message: 'Sucesso',
          description: 'O cadastro foi realizado com sucesso.'
        })
      } else {
        await service.update(editingId, name)
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
    openCreate,
    openForEdit,
    closeModal,
    submitModal
  }
}
