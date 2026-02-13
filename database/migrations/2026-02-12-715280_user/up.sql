-- Migration generated on 2026-02-12 19:52:8

CREATE TABLE "user" (
    "id" UUID PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "password_digest" VARCHAR(60) NOT NULL
);

CREATE UNIQUE INDEX "user_email_idx" ON "user"("email");
