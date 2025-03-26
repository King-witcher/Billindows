'use client'

import { createContext, ReactNode, use } from 'react'

export interface UserContextData {
  name: string
  email: string
}

type Props = {
  children: ReactNode
  value: UserContextData
}

export const UserContext = createContext<UserContextData>({
  name: '',
  email: '',
})

export function UserProvider(props: Props) {
  return <UserContext {...props} />
}

export const useUser = () => use(UserContext)
