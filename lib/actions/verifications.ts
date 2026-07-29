"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BusinessStatus, Role, DocStatus } from "@prisma/client";

export type SerializedBusinessDocument = {
  id: string;
  docType: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
};

export type SerializedVerification = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  npwp: string | null;
  businessStatus: string | null;
  createdAt: string;
  documents: SerializedBusinessDocument[];
};

export async function getVerifications(
  q = "",
  status = "ALL",
  page = 1,
  pageSize = 20
): Promise<{ verifications: SerializedVerification[]; total: number; stats: Record<string, number> }> {
  const where = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              { companyName: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {},
      { businessStatus: { not: null } },
      status !== "ALL" ? { businessStatus: status as BusinessStatus } : {},
    ],
  };

  const countWhere = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              { companyName: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {},
      { businessStatus: { not: null } },
      status !== "ALL" ? { businessStatus: status as BusinessStatus } : {},
    ],
  };

  const [rawUsers, total, statsRaw] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        businessDocuments: true,
      },
    }),
    prisma.user.count({ where: countWhere }),
    prisma.user.groupBy({ by: ["businessStatus"], _count: { businessStatus: true }, where: { businessStatus: { not: null } } }),
  ]);

  const stats: Record<string, number> = {};
  for (const row of statsRaw) {
    if (row.businessStatus) {
      stats[row.businessStatus] = row._count.businessStatus;
    }
  }
  stats.ALL = Object.values(stats).reduce((a, b) => a + b, 0);

  const verifications = rawUsers.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    companyName: user.companyName,
    npwp: user.npwp,
    businessStatus: user.businessStatus,
    createdAt: user.createdAt.toISOString(),
    documents: user.businessDocuments.map((doc) => ({
      id: doc.id,
      docType: doc.docType,
      fileUrl: doc.fileUrl,
      status: doc.status,
      uploadedAt: doc.uploadedAt.toISOString(),
    })),
  }));

  return { verifications, total, stats };
}

export async function approveBusinessAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          role: Role.BUSINESS,
          businessStatus: BusinessStatus.APPROVED,
        },
      });
      await tx.businessDocument.updateMany({
        where: { userId, status: DocStatus.PENDING },
        data: { status: DocStatus.VERIFIED },
      });
    });
    revalidatePath("/admin/verifications");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menyetujui akun bisnis." };
  }
}

export async function rejectBusinessAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          businessStatus: BusinessStatus.REJECTED,
        },
      });
      await tx.businessDocument.updateMany({
        where: { userId, status: DocStatus.PENDING },
        data: { status: DocStatus.REJECTED },
      });
    });
    revalidatePath("/admin/verifications");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menolak akun bisnis." };
  }
}
