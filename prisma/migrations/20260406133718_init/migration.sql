-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLATFORM_ADMIN', 'ESTATE_MANAGER', 'RESIDENT');

-- CreateEnum
CREATE TYPE "ResidentType" AS ENUM ('LANDLORD', 'TENANT');

-- CreateEnum
CREATE TYPE "EstateStatus" AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "LevyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING_REVIEW', 'PAID', 'DISPUTED');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('SECURITY', 'MAINTENANCE', 'UTILITIES', 'ADMINISTRATION', 'OTHER');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'RESOLVED', 'ESCALATED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'RESIDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Lagos',
    "unitCount" INTEGER NOT NULL,
    "status" "EstateStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "publicToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstateManager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "estateId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Chairman',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstateManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resident" (
    "id" TEXT NOT NULL,
    "estateId" TEXT NOT NULL,
    "userId" TEXT,
    "unitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "type" "ResidentType" NOT NULL DEFAULT 'TENANT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Levy" (
    "id" TEXT NOT NULL,
    "estateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amountKobo" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "LevyStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Levy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoredFile" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoredFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "estateId" TEXT NOT NULL,
    "levyId" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "receiptFileId" TEXT,
    "receiptUploadedAt" TIMESTAMP(3),
    "paystackRef" TEXT,
    "paidAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "estateId" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amountKobo" INTEGER NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "receiptFileId" TEXT,
    "correctionNote" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "estateId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "proofFileId" TEXT,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Estate_publicToken_key" ON "Estate"("publicToken");

-- CreateIndex
CREATE UNIQUE INDEX "EstateManager_userId_key" ON "EstateManager"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Resident_estateId_unitId_key" ON "Resident"("estateId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "Resident_estateId_phone_key" ON "Resident"("estateId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_receiptFileId_key" ON "Payment"("receiptFileId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paystackRef_key" ON "Payment"("paystackRef");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_levyId_residentId_key" ON "Payment"("levyId", "residentId");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_receiptFileId_key" ON "Expense"("receiptFileId");

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_paymentId_key" ON "Dispute"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_proofFileId_key" ON "Dispute"("proofFileId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateManager" ADD CONSTRAINT "EstateManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstateManager" ADD CONSTRAINT "EstateManager_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "Estate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "Estate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Levy" ADD CONSTRAINT "Levy_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "Estate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoredFile" ADD CONSTRAINT "StoredFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_levyId_fkey" FOREIGN KEY ("levyId") REFERENCES "Levy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_receiptFileId_fkey" FOREIGN KEY ("receiptFileId") REFERENCES "StoredFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "Estate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_receiptFileId_fkey" FOREIGN KEY ("receiptFileId") REFERENCES "StoredFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_proofFileId_fkey" FOREIGN KEY ("proofFileId") REFERENCES "StoredFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
