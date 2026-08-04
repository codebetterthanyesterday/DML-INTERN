"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { AuditAction } from "@prisma/client"

// Helper to log audit actions securely
async function logSuperAdminAudit(targetId: string, action: AuditAction, details?: string) {
  try {
    const session = await auth()
    const superAdminId = session?.user?.id
    
    if (!superAdminId) return

    await prisma.auditLog.create({
      data: {
        adminId: superAdminId,
        targetId,
        action,
        details,
      }
    })
  } catch (error) {
    console.error("Failed to write superadmin audit log:", error)
  }
}

// Ensure the caller is a SUPER_ADMIN
async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createAdminAccount(data: { name: string; email: string; phone?: string; password?: string }) {
  try {
    await requireSuperAdmin();

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar." };
    }

    if (!data.password || data.password.length < 6) {
      return { success: false, error: "Kata sandi minimal 6 karakter." };
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const newAdmin = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        passwordHash,
        role: "ADMIN",
      },
    });

    await logSuperAdminAudit(newAdmin.id, "ROLE_CHANGED", JSON.stringify({ details: "Admin Account Created" }));
    
    revalidatePath("/superadmin/admins");
    return { success: true, message: "Admin berhasil ditambahkan." };
  } catch (error) {
    console.error("createAdminAccount error:", error);
    return { success: false, error: "Gagal membuat akun Admin." };
  }
}

export async function updateAdminAccount(id: string, data: { name: string; email: string; phone?: string; password?: string }) {
  try {
    await requireSuperAdmin();

    const existingAdmin = await prisma.user.findUnique({ where: { id } });
    if (!existingAdmin || existingAdmin.role !== "ADMIN") {
      return { success: false, error: "Admin tidak ditemukan." };
    }

    // If changing email, ensure it doesn't collide
    if (data.email !== existingAdmin.email) {
      const emailCollision = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailCollision) {
        return { success: false, error: "Email sudah digunakan oleh akun lain." };
      }
    }

    const updateData: any = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
    };

    if (data.password && data.password.trim() !== "") {
      if (data.password.length < 6) {
        return { success: false, error: "Kata sandi minimal 6 karakter." };
      }
      updateData.passwordHash = await bcrypt.hash(data.password, 12);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    await logSuperAdminAudit(id, "ROLE_CHANGED", JSON.stringify({ details: "Admin Details Updated" }));
    
    revalidatePath("/superadmin/admins");
    return { success: true, message: "Detail Admin berhasil diperbarui." };
  } catch (error) {
    console.error("updateAdminAccount error:", error);
    return { success: false, error: "Gagal memperbarui Admin." };
  }
}

export async function toggleAdminSuspension(id: string, suspend: boolean) {
  try {
    await requireSuperAdmin();

    const admin = await prisma.user.findUnique({ where: { id } });
    if (!admin || admin.role !== "ADMIN") {
      return { success: false, error: "Admin tidak ditemukan." };
    }

    await prisma.user.update({
      where: { id },
      data: { isSuspended: suspend },
    });

    const action: AuditAction = suspend ? "USER_SUSPENDED" : "USER_UNSUSPENDED";
    await logSuperAdminAudit(id, action, JSON.stringify({ reason: suspend ? "Suspended by Super Admin" : "Restored by Super Admin" }));
    
    revalidatePath("/superadmin/admins");
    return { success: true, message: suspend ? "Akun Admin telah ditangguhkan." : "Akun Admin telah dipulihkan." };
  } catch (error) {
    console.error("toggleAdminSuspension error:", error);
    return { success: false, error: "Gagal memperbarui status Admin." };
  }
}
