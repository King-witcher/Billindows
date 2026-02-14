-- Migration generated on 2026-02-12 20:42:49

CREATE TABLE fixed_transaction (
    "id"          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"     UUID      NOT NULL,
    "category_id" UUID      NOT NULL,
    "name"        TEXT      NOT NULL,
    "amount"      INTEGER   NOT NULL,
    "start_date"  DATE      NOT NULL,
    "end_date"    DATE
);

CREATE INDEX ft_user_id_start_date_idx ON fixed_transaction("user_id", "start_date" DESC);
