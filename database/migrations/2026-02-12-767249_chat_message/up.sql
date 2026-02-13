-- Migration generated on 2026-02-12 21:18:44

CREATE TYPE chat_message_role as ENUM (
  'user',
  'assistant',
  'system',
  'function',
  'internal' -- Used for system-generated messages that shouldn't be exposed to the LLM, like error messages or debug info
);

CREATE TYPE chat_message_llm_provider as ENUM (
  'openai',
  'gemini',
  'azure',
  'anthropic'
);

CREATE TABLE chat_message (
  "id"                          UUID              PRIMARY KEY, -- UUID v7
  "user_id"                     UUID              NOT NULL,
  "role"                        chat_message_role NOT NULL,
  "content"                     TEXT,
  "function_call_id"            TEXT,   -- when role = 'function'
  "function_calls"              JSONB,  -- when role = 'assistant'
  "function_execution_time_ms"  INTEGER,
  "llm_provider"                chat_message_llm_provider -- Used to track LLM compatibility among function
);

CREATE INDEX chat_message_user_id_idx ON chat_message(
  "user_id",
  "id" DESC
);

CREATE FUNCTION uuidv7_timestamp(uuid UUID)
  RETURNS TIMESTAMP WITHOUT TIME ZONE
  LANGUAGE sql
  IMMUTABLE
AS $function$
  SELECT to_timestamp(('x'||replace(uuid::text, '-', ''))::bit(48)::bigint / 1000) AS result;
$function$;
