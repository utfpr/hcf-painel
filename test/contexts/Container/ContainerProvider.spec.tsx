import type { ReactNode } from 'react'

import { ContainerProvider } from '@/contexts/Container/ContainerProvider'
import { useContainer } from '@/contexts/Container/useContainer'
import { renderHook } from '@testing-library/react'

function wrapper({ children }: { children: ReactNode }) {
  return (
    <ContainerProvider baseUrl="https://api.example.com">
      {children}
    </ContainerProvider>
  )
}

describe('ContainerProvider', () => {
  it('keeps the same HttpClient instance across re-renders', () => {
    const { result, rerender } = renderHook(() => useContainer(), { wrapper })

    const first = result.current.httpClient
    rerender()

    expect(result.current.httpClient).toBe(first)
  })
})
