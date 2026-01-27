/*
  Warnings:

  - You are about to drop the column `createdAt` on the `RedirectLog` table. All the data in the column will be lost.
  - You are about to alter the column `country` on the `RedirectLog` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.

*/
-- DropForeignKey
ALTER TABLE "RedirectLog" DROP CONSTRAINT "RedirectLog_shortUrlId_fkey";

-- DropForeignKey
ALTER TABLE "ShortUrl" DROP CONSTRAINT "ShortUrl_userId_fkey";

-- DropIndex
DROP INDEX "RedirectLog_shortUrlId_idx";

-- DropIndex
DROP INDEX "ShortUrl_shortCode_idx";

-- AlterTable
ALTER TABLE "RedirectLog" DROP COLUMN "createdAt",
ALTER COLUMN "country" SET DATA TYPE CHAR(2);

-- AlterTable
ALTER TABLE "ShortUrl" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "RedirectLog_shortUrlId_timestamp_idx" ON "RedirectLog"("shortUrlId", "timestamp");

-- AddForeignKey
ALTER TABLE "ShortUrl" ADD CONSTRAINT "ShortUrl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedirectLog" ADD CONSTRAINT "RedirectLog_shortUrlId_fkey" FOREIGN KEY ("shortUrlId") REFERENCES "ShortUrl"("id") ON DELETE CASCADE ON UPDATE CASCADE;
