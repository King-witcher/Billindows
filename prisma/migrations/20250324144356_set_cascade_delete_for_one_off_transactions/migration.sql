-- DropForeignKey
ALTER TABLE "one_off_transactions" DROP CONSTRAINT "one_off_transactions_category_id_fkey";

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "goal" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "one_off_transactions" ADD CONSTRAINT "one_off_transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
