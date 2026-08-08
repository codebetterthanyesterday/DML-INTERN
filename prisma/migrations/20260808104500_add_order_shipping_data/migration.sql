ALTER TABLE "orders"
ADD COLUMN "deliveryNoteUrl" TEXT,
ADD COLUMN "deliveryNoteName" TEXT,
ADD COLUMN "shippedAt" TIMESTAMP(3);
