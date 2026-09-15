/*
  Warnings:

  - You are about to drop the column `users_id` on the `Link` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_users_id_fkey";

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "users_id",
ADD COLUMN     "user_id" TEXT;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
