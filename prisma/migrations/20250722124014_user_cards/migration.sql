/*
  Warnings:

  - You are about to drop the column `assigneeId` on the `Card` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_assigneeId_fkey";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "assigneeId",
ADD COLUMN     "markdownContent" TEXT;

-- CreateTable
CREATE TABLE "_CardAssignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CardAssignees_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CardAssignees_B_index" ON "_CardAssignees"("B");

-- AddForeignKey
ALTER TABLE "_CardAssignees" ADD CONSTRAINT "_CardAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardAssignees" ADD CONSTRAINT "_CardAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
