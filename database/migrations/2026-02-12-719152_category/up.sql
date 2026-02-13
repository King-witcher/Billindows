-- Migration generated on 2026-02-12 19:58:35

CREATE TABLE "category" (
    "id"        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"   UUID    NOT NULL,
    "name"      TEXT    NOT NULL,
    "color"     CHAR(7) NOT NULL,
    "goal"      INTEGER
);

CREATE INDEX "category_user_id_idx" ON "category"("user_id");
