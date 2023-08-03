import { useRef, useState, useEffect } from 'react'

import throttle from 'lodash.throttle'

import {
  getScrollTop,
  getScrollBottom,
  getScrollPercentage
} from '../helpers/scroll-helper'

function useScroll(millis = 100) {
  const scrollThrottle = useRef(millis)
  const [scroll, setScroll] = useState({
    hasScrolled: false,
    top: 0,
    bottom: 0,
    percentage: 0
  })

  useEffect(() => {
    scrollThrottle.current = millis
  }, [millis])

  useEffect(() => {
    const updateScroll = () => {
      setScroll({
        hasScrolled: true,
        top: getScrollTop(),
        bottom: getScrollBottom(),
        percentage: getScrollPercentage()
      })
    }
    const scrollListener = throttle(updateScroll, scrollThrottle.current)

    window.addEventListener('scroll', scrollListener)
    return () => {
      window.removeEventListener('scroll', scrollListener)
    }
  }, [])

  return scroll
}

export default useScroll
