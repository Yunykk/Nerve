import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { NerveStore } from '../domain/NerveStore'
import { EMPTY_DOMAIN_STATE, type DomainState } from '../domain/types'
import { LocalEventStorage } from '../storage/LocalEventStorage'
import {
  NerveContext,
  type LoadStatus,
  type NerveActions,
  type NerveContextValue,
} from './nerve-context'

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unknown local error occurred.'
}

export function NerveProvider({ children }: { readonly children: ReactNode }) {
  const [store] = useState(
    () => new NerveStore(new LocalEventStorage(window.localStorage)),
  )
  const [state, setState] = useState<DomainState>(EMPTY_DOMAIN_STATE)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [pending, setPending] = useState(false)
  const [fatalError, setFatalError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const unsubscribe = store.subscribe(setState)
    store
      .initialize()
      .then((nextState) => {
        setState(nextState)
        setStatus('ready')
      })
      .catch((error: unknown) => {
        setFatalError(getErrorMessage(error))
        setStatus('error')
      })

    return unsubscribe
  }, [store])

  const perform = useCallback(
    async (operation: () => Promise<void>, successMessage: string): Promise<boolean> => {
      setPending(true)
      setActionError('')
      setFeedback('')

      try {
        await operation()
        setFeedback(successMessage)
        return true
      } catch (error) {
        setActionError(getErrorMessage(error))
        return false
      } finally {
        setPending(false)
      }
    },
    [],
  )

  const actions = useMemo<NerveActions>(
    () => ({
      async createEntity(kind, name, description) {
        return perform(
          async () => {
            await store.createEntity(kind, name, description)
          },
          kind === 'goal' ? 'Goal added to the system.' : 'Project added to the system.',
        )
      },
      async connectProjectToGoal(projectId, goalId) {
        return perform(
          () => store.connectProjectToGoal(projectId, goalId),
          'Project connected to goal.',
        )
      },
      async startSession(projectId) {
        return perform(
          () => store.startSession(projectId),
          'Focus session started.',
        )
      },
      async stopSession() {
        return perform(() => store.stopSession(), 'Focus session saved to the timeline.')
      },
    }),
    [perform, store],
  )

  const clearMessages = useCallback(() => {
    setFeedback('')
    setActionError('')
  }, [])

  const value = useMemo<NerveContextValue>(
    () => ({
      state,
      status,
      pending,
      fatalError,
      feedback,
      actionError,
      actions,
      clearMessages,
    }),
    [
      actionError,
      actions,
      clearMessages,
      fatalError,
      feedback,
      pending,
      state,
      status,
    ],
  )

  return <NerveContext.Provider value={value}>{children}</NerveContext.Provider>
}
