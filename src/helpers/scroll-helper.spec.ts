import { getScrollPosition } from './scroll-helper'

describe('Helper > getScrollPosition', () => {
  it('should prioritize window property', () => {
    window.scrollY = 10

    const scroll = getScrollPosition()
    expect(scroll).toBe(10)
  })

  it('should return documentElement scroll property in case of zero value in window property', () => {
    window.scrollY = 0
    document.documentElement.scrollTop = 21

    const scroll = getScrollPosition()
    expect(scroll).toBe(21)
  })
})
