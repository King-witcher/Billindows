-- Migration generated on 2026-02-12 21:18:44

DROP FUNCTION uuidv7_timestamp;
DROP INDEX chat_message_user_id_idx;
DROP TABLE chat_message;
DROP TYPE chat_message_role;
DROP TYPE chat_message_llm_provider;
