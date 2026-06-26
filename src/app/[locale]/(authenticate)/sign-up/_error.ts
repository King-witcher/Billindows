export enum SignUpError {
  InvalidFormData = 'invalid-form-data',
  EmailAlreadyInUse = 'email-already-in-use',
  PasswordsDoNotMatch = 'passwords-do-not-match',
}

/** Maps an error name to a key under the `auth.errors` i18n namespace. */
export function errorKey(
  name: string,
): 'invalidForm' | 'emailInUse' | 'passwordsMismatch' | 'generic' {
  switch (name) {
    case SignUpError.InvalidFormData:
      return 'invalidForm'
    case SignUpError.EmailAlreadyInUse:
      return 'emailInUse'
    case SignUpError.PasswordsDoNotMatch:
      return 'passwordsMismatch'
    default:
      return 'generic'
  }
}
