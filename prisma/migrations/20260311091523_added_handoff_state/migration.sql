/*
  Warnings:

  - You are about to drop the column `isPending` on the `Handoff` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "HandoffState" AS ENUM ('CREATED', 'CONNECTED', 'DONE');

-- AlterTable
ALTER TABLE "Handoff" DROP COLUMN "isPending",
ADD COLUMN     "state" "HandoffState" NOT NULL DEFAULT 'CREATED';
