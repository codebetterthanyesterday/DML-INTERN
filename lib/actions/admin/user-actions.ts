"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { AuditAction, BusinessStatus, DocStatus } from "@prisma/client"
import { auth } from "@/lib/auth"

// Helper to log audit actions
async function logAudit(targetId: string, action: AuditAction, details?: string) {
  try {
    const session = await auth()
    const adminId = session?.user?.id
    
    if (!adminId) {
      console.error("No admin session found for audit log")
      return
    }

    await prisma.auditLog.create({
      data: {
        adminId,
        targetId,
        action,
        details,
      }
    })
  } catch (error) {
    console.error("Failed to write audit log:", error)
  }
}

export async function getUsers(query?: string, role?: string, status?: string) {
  try {
    const where: any = {}
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { companyName: { contains: query, mode: "insensitive" } },
      ]
    }
    if (role && role !== "ALL") {
      where.role = role
    }
    if (status && status !== "ALL") {
      where.businessStatus = status
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        companyName: true,
        businessStatus: true,
        isSuspended: true,
        createdAt: true,
      }
    })
    return { success: true, users }
  } catch (error) {
    console.error("getUsers error:", error)
    return { success: false, error: "Failed to fetch users" }
  }
}

export async function getUserDetails(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        businessDocuments: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5
        },
        quotes: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    })
    
    if (!user) return { success: false, error: "User not found" }
    
    // Fetch logs separately to handle targetId which is string matching userId
    const auditLogs = await prisma.auditLog.findMany({
      where: { targetId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { admin: { select: { name: true } } }
    })
    
    return { success: true, user: { ...user, auditLogs } }
  } catch (error) {
    console.error("getUserDetails error:", error)
    return { success: false, error: "Failed to fetch user details" }
  }
}

export async function updateBusinessStatus(userId: string, status: BusinessStatus, reason?: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { businessStatus: status }
    })

    if (status === "APPROVED") {
      await prisma.notification.create({
        data: {
          userId,
          type: "BUSINESS_VERIFICATION",
          title: "Akun Bisnis Disetujui",
          message: "Selamat! Akun bisnis Anda telah disetujui. Anda sekarang dapat mengakses fitur B2B.",
        }
      })
      await logAudit(userId, "USER_APPROVED")
    } else if (status === "REJECTED") {
      await prisma.notification.create({
        data: {
          userId,
          type: "BUSINESS_VERIFICATION",
          title: "Akun Bisnis Ditolak",
          message: reason || "Maaf, pendaftaran akun bisnis Anda tidak dapat disetujui saat ini.",
        }
      })
      await logAudit(userId, "USER_REJECTED", JSON.stringify({ reason }))
    }

    revalidatePath("/admin/accounts")
    return { success: true }
  } catch (error) {
    console.error("updateBusinessStatus error:", error)
    return { success: false, error: "Failed to update business status" }
  }
}

export async function updateDocumentStatus(docId: string, status: DocStatus) {
  try {
    const doc = await prisma.businessDocument.update({
      where: { id: docId },
      data: { status }
    })
    await logAudit(doc.userId, status === "VERIFIED" ? "DOCUMENT_VERIFIED" : "DOCUMENT_REJECTED", JSON.stringify({ docId, type: doc.docType }))
    revalidatePath("/admin/accounts")
    return { success: true }
  } catch (error) {
    console.error("updateDocumentStatus error:", error)
    return { success: false, error: "Failed to update document status" }
  }
}

export async function toggleUserSuspension(userId: string, isSuspended: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isSuspended }
    })
    
    await logAudit(userId, isSuspended ? "USER_SUSPENDED" : "USER_UNSUSPENDED")
    revalidatePath("/admin/accounts")
    return { success: true }
  } catch (error) {
    console.error("toggleUserSuspension error:", error)
    return { success: false, error: "Failed to toggle suspension status" }
  }
}

export async function deleteUser(userId: string) {
  try {
    // Delete related records that might not have cascade delete, though User model has many cascades.
    await prisma.user.delete({
      where: { id: userId }
    })
    await logAudit(userId, "USER_DELETED")
    revalidatePath("/admin/accounts")
    return { success: true }
  } catch (error) {
    console.error("deleteUser error:", error)
    return { success: false, error: "Failed to delete user" }
  }
}

export async function makeUserAdmin(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" }
    })
    await logAudit(userId, "ROLE_CHANGED", JSON.stringify({ newRole: "ADMIN" }))
    revalidatePath("/admin/accounts")
    return { success: true }
  } catch (error) {
    console.error("makeUserAdmin error:", error)
    return { success: false, error: "Failed to promote user to admin" }
  }
}

export async function createAdmin(data: any) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const { name, email, phone, password } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar" };
    }

    const bcrypt = (await import("bcryptjs")).default;
    const passwordHash = await bcrypt.hash(password, 12);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "ADMIN",
      },
    });

    await logAudit(newAdmin.id, "ROLE_CHANGED", JSON.stringify({ details: "Created as new Admin" }));
    
    revalidatePath("/admin/accounts");
    return { success: true, message: "Admin berhasil dibuat" };
  } catch (error) {
    console.error("createAdmin error:", error);
    return { success: false, error: "Gagal membuat admin" };
  }
}
