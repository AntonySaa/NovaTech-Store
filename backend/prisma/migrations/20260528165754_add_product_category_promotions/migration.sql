-- CreateEnum
CREATE TYPE "public"."ProductCategory" AS ENUM ('COMPUTO', 'PERIFERICOS', 'GAMING', 'AUDIO', 'MOVIL');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "category" "public"."ProductCategory" NOT NULL DEFAULT 'COMPUTO',
ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "discountPercent" INTEGER NOT NULL DEFAULT 0;
