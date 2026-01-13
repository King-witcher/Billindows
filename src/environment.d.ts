declare global {
  namespace NodeJS {
    interface ProcessEnv {
      POSTGRES_URL: string
      JWT_SECRET: string
      OPENAI_API_KEY: string
      OPENAI_MODEL: string
    }
  }
}

export {}
