/** Represents an application error that can be exposed to the client */
export class ClientError<TError extends string = string> extends Error {
  constructor(
    public readonly code: TError,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = code
  }
}

export function fail(code: string, message?: string, options?: ErrorOptions): never {
  throw new ClientError(code, message, options)
}

/** Represents a fatal error that should stop the request and should not be exposed to the client */
export class FatalError extends Error {
  name = 'FatalError'
}

export function fatal(message: string, options?: ErrorOptions): never {
  throw new FatalError(message, options)
}

/** Represents the error that is exposed to the client when a fatal or unknown error occurs */
export class InternalError extends Error {
  name = 'InternalError'
  message = 'An unexpected error occurred. Please try again later.'
}
