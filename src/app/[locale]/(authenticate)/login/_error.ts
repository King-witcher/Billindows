export enum SignInError {
  InvalidFormData = 'invalid-form-data',
  InvalidCredentials = 'invalid-credentials',
}

/** Maps an error name to a key under the `auth.errors` i18n namespace. */
export function errorKey(name: string): 'invalidForm' | 'invalidCredentials' | 'generic' {
  switch (name) {
    case SignInError.InvalidFormData:
      return 'invalidForm'
    case SignInError.InvalidCredentials:
      return 'invalidCredentials'
    default:
      return 'generic'
  }
}
