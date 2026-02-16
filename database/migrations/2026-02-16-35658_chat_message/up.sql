-- Migration generated on 2026-02-16 0:59:25

CREATE TYPE chat_message_role as ENUM (
  'user',           -- Messages from the user
  'assistant',      -- Messages from the assistant (LLM)
  'function_call',  -- Messages representing a function call made by the assistant
  'system',         -- Messages from the system, like prompts or instructions for the assistant
  'internal'        -- Used for system-generated messages that shouldn't be exposed to the LLM, like error messages or debug info
);

CREATE TYPE chat_message_llm_provider as ENUM (
  'anthropic',
  'azure',
  'gemini',
  'openai'
);

CREATE TABLE chat_message (
  "id"                          UUID              PRIMARY KEY,  -- UUID v7
  "user_id"                     UUID              NOT NULL,     -- Identifies the conversation
  "role"                        chat_message_role NOT NULL,
  "content"                     TEXT,

  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES "user"(id)
    ON DELETE CASCADE
);

CREATE INDEX chat_message_user_id_idx ON chat_message(
  "user_id",
  "id" DESC
);

CREATE TABLE function_call (
  "id" SERIAL PRIMARY KEY,
  "message_id" UUID NOT NULL,   -- References the message that triggered the tool call
  "call_id" TEXT NOT NULL,
  "function_name" TEXT NOT NULL,
  "arguments" JSONB,
  "result" TEXT NOT NULL,
  "provider" chat_message_llm_provider NOT NULL,
  "execution_time_ms" INTEGER NOT NULL,

  CONSTRAINT fk_message
    FOREIGN KEY(message_id)
    REFERENCES chat_message(id)
    ON DELETE CASCADE
);

CREATE INDEX function_call_message_id_idx ON function_call(message_id);

CREATE VIEW client_chat_message_view AS (
  SELECT
    id,
    user_id,
    "role",
    content,
    uuidv7_timestamp(id) AS date
  FROM chat_message
  WHERE "role" IN ('user', 'assistant', 'internal')
);

-- View for querying messages along with their associated function calls (if any)
CREATE VIEW llm_chat_message_view AS (
  SELECT
    m.id,
    m.user_id,
    m."role",
    m.content,
    CASE
      WHEN m.role = 'function_call'
        THEN JSON_AGG(
          JSON_BUILD_OBJECT(
            'call_id', fc.call_id,
            'function_name', fc.function_name,
            'arguments', fc.arguments,
            'result', fc.result,
            'provider', fc.provider
          )
        )
      ELSE NULL
    END as function_calls
  FROM chat_message m
  LEFT JOIN function_call fc
    ON m.role = 'function_call' AND m.id = fc.message_id
  WHERE m."role" IN ('user', 'assistant', 'system', 'function_call')
  GROUP BY m.id
);
