-- Migration generated on 2026-02-12 20:42:49

CREATE TABLE fixed_transaction (
    "id"          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"     UUID      NOT NULL,
    "category_id" UUID      NOT NULL,
    "name"        TEXT      NOT NULL,
    "amount"      INTEGER   NOT NULL,
    "start_date"  DATE      NOT NULL,
    "end_date"    DATE,

    FOREIGN KEY (user_id, category_id)
        REFERENCES category(user_id, id) ON DELETE CASCADE
);

CREATE INDEX ft_user_id_start_date_idx ON fixed_transaction("user_id", "start_date" DESC);
CREATE INDEX ft_category_id_idx ON fixed_transaction("category_id");
