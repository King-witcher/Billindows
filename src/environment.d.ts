declare global {
  namespace NodeJS {
    interface ProcessEnv {
      POSTGRES_URL: string
      NEXT_PUBLIC_FIREBASE_CONFIG: string
      JWT_SECRET: string
    }
  }
}

export {}
