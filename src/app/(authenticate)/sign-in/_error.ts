export enum SignInError {
  InvalidFormData = 'invalid-form-data',
  InvalidCredentials = 'invalid-credentials',
}

export function getErrorMessage(error: string) {
  switch (error) {
    case SignInError.InvalidFormData:
      return 'The provided form data is invalid. Please check your input and try again.'
    case SignInError.InvalidCredentials:
      return 'The provided credentials are invalid. Please check your email and password and try again.'
    default:
      return 'An unknown error occurred. Please contact Giuseppe and try again later.'
  }
}
