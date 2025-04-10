export enum ActionStateEnum {
  Idle = 'idle',
  Success = 'success',
  Error = 'error',
}

export type ActionState =
  | {
      state: ActionStateEnum.Idle | ActionStateEnum.Success
      code?: never
      message?: never
    }
  | {
      state: ActionStateEnum.Error
      code: string
      message?: string
    }

export namespace ActionState {
  export function error(code: string, message?: string): ActionState {
    return {
      state: ActionStateEnum.Error,
      code,
      message,
    }
  }

  export function success(): ActionState {
    return {
      state: ActionStateEnum.Success,
    }
  }

  export function idle(): ActionState {
    return {
      state: ActionStateEnum.Idle,
    }
  }
}

export class ActionError extends Error {
  constructor(
    public code: string,
    message?: string
  ) {
    super(message)

    this.name = 'ActionError'
  }
}

/**
 * @param fn Void function that might throw ActionError, which will be caught and returned as ActionState
 * @returns
 */
export function withActionState<T extends Array<unknown>>(
  fn: (...params: T) => Promise<void>
): (previousState: ActionState, ...params: T) => Promise<ActionState> {
  return async (_previousState: ActionState, ...params: T) => {
    try {
      await fn(...params)
      return ActionState.success()
    } catch (e) {
      if (e instanceof ActionError) return ActionState.error(e.code, e.message)
      console.error('Uncaught error on action state management:')
      console.error((e as Error).message)
      throw e
    }
  }
}
