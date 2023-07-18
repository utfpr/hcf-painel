import { useMemo } from 'react'

import classNames, { Argument } from 'classnames'

const useClassNames = (...classes: Argument[]) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => classNames(classes), classes)
}

export default useClassNames
