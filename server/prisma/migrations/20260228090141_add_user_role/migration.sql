/*
  Warnings:

  - You are about to drop the `legacy_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" INTEGER NOT NULL DEFAULT 2;

-- DropTable
DROP TABLE "legacy_users";
