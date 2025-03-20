export enum FormStateEnum {
  Idle = 'idle',
  Success = 'success',
  Error = 'error',
}

export type FormState = {
  state: FormStateEnum
  message?: string
}

export namespace FormState {
  export function error(message: string): FormState {
    return {
      state: FormStateEnum.Error,
      message: message,
    }
  }

  export function success(): FormState {
    return {
      state: FormStateEnum.Success,
    }
  }

  export function idle(): FormState {
    return {
      state: FormStateEnum.Idle,
    }
  }
}
