export type SERIAL = number

export type BOOLEAN = boolean

export type INTEGER = number

export type TIMESTAMPTZ = Date

export type TEXT = string
export type VARCHAR = string
export type VARCHAR_60 = string
export type UUID = `${string}-${string}-${string}-${string}-${string}`
export type UUID_v7 = UUID

export type VECTOR_1536 = number[]

export type JSONB = boolean | number | string | (JSONB | null)[] | { [key: string]: JSONB | null }
