import {
  describe,
  expect,
  test
} from 'vitest'

import { resolveDark } from '@/theme/appearance'

describe('resolveDark', () => {
  test('follows the operating system when appearance is system', () => {
    expect(resolveDark('system', true)).toBe(true)
    expect(resolveDark('system', false)).toBe(false)
  })

  test('ignores the operating system when appearance is set manually', () => {
    expect(resolveDark('light', true)).toBe(false)
    expect(resolveDark('dark', false)).toBe(true)
  })
})
