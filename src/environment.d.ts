declare global {
  namespace NodeJS {
    interface ProcessEnv {
      POSTGRES_URL: string
      JWT_SECRET: string
    }
  }
}

export {}
