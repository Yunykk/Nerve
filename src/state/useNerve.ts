import { useContext } from 'react'
import { NerveContext, type NerveContextValue } from './nerve-context'

export function useNerve(): NerveContextValue {
  const context = useContext(NerveContext)

  if (!context) {
    throw new Error('useNerve must be used inside NerveProvider.')
  }

  return context
}
