import { useRef, useState, useEffect } from 'react'

import _ from 'lodash'

import {
  getScrollTop,
  getScrollBottom,
  getScrollPercentage
} from '../helpers/scroll-helper'

function useScroll(throttle = 100) {
  const scrollThrottle = useRef(throttle)
  const [scroll, setScroll] = useState({
    hasScrolled: false,
    top: 0,
    bottom: 0,
    percentage: 0
  })

  useEffect(() => {
    scrollThrottle.current = throttle
  }, [throttle])

  useEffect(() => {
    const updateScroll = () => {
      setScroll({
        hasScrolled: true,
        top: getScrollTop(),
        bottom: getScrollBottom(),
        percentage: getScrollPercentage()
      })
    }
    const scrollListener = _.throttle(updateScroll, scrollThrottle.current)

    window.addEventListener('scroll', scrollListener)
    return () => {
      window.removeEventListener('scroll', scrollListener)
    }
  }, [])

  return scroll
}

export default useScroll
