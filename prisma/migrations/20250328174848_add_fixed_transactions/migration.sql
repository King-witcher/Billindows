-- CreateTable
CREATE TABLE "fixed_transactions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "fixed_transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fixed_transactions" ADD CONSTRAINT "fixed_transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
