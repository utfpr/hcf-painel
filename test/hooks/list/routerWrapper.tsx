import React, { type ReactNode } from 'react'

import {
  MemoryRouter, Route, Routes
} from 'react-router'

export function SearchParamsWrapper({
  children,
  initialEntry = '/usuarios'
}: {
  children: ReactNode
  initialEntry?: string
}) {
  return (
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/usuarios" element={children} />
      </Routes>
    </MemoryRouter>
  )
}
