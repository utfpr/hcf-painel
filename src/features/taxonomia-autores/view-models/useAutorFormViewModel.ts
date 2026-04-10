import {
  useCallback, useMemo, useRef, useState
} from 'react'

import { useForm } from 'react-hook-form'

import { useNotification } from '@/hooks/useNotification'

import { AutorService } from '../services/AutorService'
import type { Autor, AutorFormValues } from '../types'

export interface AutorFormViewModel {
  form: ReturnType<typeof useForm<AutorFormValues>>
  visibleModal: boolean
  modalTitle: string
  loadingModal: boolean
  editingId: number | string
  openCreate: () => void
  openForEdit: (autor: Autor) => void
  closeModal: () => void
  submitModal: () => Promise<void>
}

export interface UseAutorFormViewModelOptions {
  onSuccess: () => void | Promise<void>
}

export function useAutorFormViewModel(options: UseAutorFormViewModelOptions): AutorFormViewModel {
  const service = useMemo(() => AutorService.getInstance(), [])
  const { showNotification } = useNotification()
  const notifyRef = useRef(showNotification)
  notifyRef.current = showNotification
  const onSuccessRef = useRef(options.onSuccess)
  onSuccessRef.current = options.onSuccess

  const form = useForm<AutorFormValues>({
    defaultValues: { nome: '', observacao: '' }
  })

  const [visibleModal, setVisibleModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('Cadastrar')
  const [loadingModal, setLoadingModal] = useState(false)
  const [editingId, setEditingId] = useState<number | string>(-1)

  const openCreate = useCallback(() => {
    setModalTitle('Cadastrar')
    setEditingId(-1)
    form.reset({ nome: '', observacao: '' })
    setVisibleModal(true)
  }, [form])

  const openForEdit = useCallback(
    (autor: Autor) => {
      setModalTitle('Atualizar')
      setEditingId(autor.id)
      form.reset({
        nome: autor.nome,
        observacao: autor.observacao ?? ''
      })
      setVisibleModal(true)
    },
    [form]
  )

  const closeModal = useCallback(() => {
    setVisibleModal(false)
    form.reset({ nome: '', observacao: '' })
    setEditingId(-1)
  }, [form])

  const submitModal = useCallback(async () => {
    const nome = form.getValues('nome')?.trim()
    if (!nome) {
      notifyRef.current({
        type: 'warning',
        message: 'Falha',
        description: 'Informe o nome do novo autor.'
      })
      return
    }

    const observacao = form.getValues('observacao')?.trim() ?? ''

    setLoadingModal(true)
    try {
      if (editingId === -1) {
        await service.create(nome, observacao)
        notifyRef.current({
          type: 'success',
          message: 'Sucesso',
          description: 'O cadastro foi realizado com sucesso.'
        })
      } else {
        await service.update(editingId, nome, observacao)
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
