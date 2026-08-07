import { createContext } from 'react'
import type { DomainState, EntityKind } from '../domain/types'

export type LoadStatus = 'loading' | 'ready' | 'error'

export interface NerveActions {
  createEntity(kind: EntityKind, name: string, description?: string): Promise<boolean>
  connectProjectToGoal(projectId: string, goalId: string): Promise<boolean>
  startSession(projectId: string): Promise<boolean>
  stopSession(): Promise<boolean>
}

export interface NerveContextValue {
  readonly state: DomainState
  readonly status: LoadStatus
  readonly pending: boolean
  readonly fatalError: string
  readonly feedback: string
  readonly actionError: string
  readonly actions: NerveActions
  clearMessages(): void
}

export const NerveContext = createContext<NerveContextValue | null>(null)
