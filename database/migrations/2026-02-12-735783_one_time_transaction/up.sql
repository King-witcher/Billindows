-- Migration generated on 2026-02-12 20:26:18

CREATE TABLE one_time_transaction (
    "id"            UUID    PRIMARY KEY,
    "user_id"       UUID    NOT NULL,
    "category_id"   UUID    NOT NULL,
    "name"          TEXT    NOT NULL,
    "amount"        INTEGER NOT NULL,
    "forecast"      BOOLEAN NOT NULL,
    "date"          DATE    NOT NULL
);

CREATE INDEX ott_user_id_date_idx ON one_time_transaction("user_id", "date" DESC);
CREATE INDEX ott_category_id_idx ON one_time_transaction("category_id");
