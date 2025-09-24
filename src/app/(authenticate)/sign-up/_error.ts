export enum SignUpError {
  InvalidFormData = 'invalid-form-data',
  EmailAlreadyInUse = 'email-already-in-use',
  PasswordsDoNotMatch = 'passwords-do-not-match',
}

export function getErrorMessage(error: string) {
  switch (error) {
    case SignUpError.InvalidFormData:
      return 'The provided form data is invalid. Please check your input and try again.'
    case SignUpError.EmailAlreadyInUse:
      return 'The provided email is already in use. Please use a different email or sign in.'
    case SignUpError.PasswordsDoNotMatch:
      return 'The provided passwords do not match. Please check your input and try again.'
    default:
      return 'An unknown error occurred. Please contact Giuseppe and try again later.'
  }
}
