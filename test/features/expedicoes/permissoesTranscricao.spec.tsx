import {
  describe, expect, it
} from 'vitest'

import type { Usuario } from '@/@types/components'
import { TranscricaoAudio } from '@/features/expedicoes/components/TranscricaoAudio'
import { Manager } from '@/libraries/auth/Manager'
import { createRules } from '@/resources/permissions'
import { render, screen } from '@testing-library/react'

const arquivo = {
  id: 7, nome: 'Áudio do diário', url: '/uploads/audio.m4a', mimeType: 'audio/mp4', tamanho: 100
}

function usuarioSalvo(tipo: number | string): Usuario {
  // Reproduces a legacy session restored from localStorage, whose role may be a string.
  return JSON.parse(JSON.stringify({
    id: 1, nome: 'Teste', email: 'teste@example.test', tipo_usuario_id: tipo
  })) as Usuario
}

describe('Permissão de transcrição de evidências', () => {
  it.each([
    1,
    2,
    '1',
    '2'
  ])('mostra Transcrever para curador/operador com perfil %s', tipo => {
    const manager = new Manager({ rules: createRules(usuarioSalvo(tipo)) })
    render(<TranscricaoAudio arquivo={arquivo} podeEditar={manager.can('update', 'Evidencia')} />)
    expect(screen.getByRole('button', { name: 'Transcrever' })).toBeInTheDocument()
  })

  it.each([3, '3'])('não permite gerar transcrição para o perfil leitor %s', tipo => {
    const manager = new Manager({ rules: createRules(usuarioSalvo(tipo)) })
    render(<TranscricaoAudio arquivo={arquivo} podeEditar={manager.can('update', 'Evidencia')} />)
    expect(screen.queryByRole('button', { name: 'Transcrever' })).not.toBeInTheDocument()
    expect(manager.can('read', 'Evidencia')).toBe(true)
  })
})
