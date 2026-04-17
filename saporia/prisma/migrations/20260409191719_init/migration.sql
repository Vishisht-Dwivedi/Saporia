/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image` to the `MenuItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "image" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "menuItemId" TEXT,
ADD COLUMN     "menuItemName" TEXT,
ADD COLUMN     "menuItemPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_userId_key" ON "Restaurant"("userId");

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
