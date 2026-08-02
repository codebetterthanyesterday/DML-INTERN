"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  UpdateProfileInput,
  updateProfileSchema,
  ChangePasswordInput,
  changePasswordSchema,
} from "@/lib/validators/profile";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getAdminProfileData() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) throw new Error("Admin tidak ditemukan");

  const recentLogs = await prisma.auditLog.findMany({
    where: { adminId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      action: true,
      targetId: true,
      details: true,
      createdAt: true,
    },
  });

  return { user, recentLogs };
}

export async function updateAdminProfile(data: UpdateProfileInput) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  const result = updateProfileSchema.safeParse(data);
  if (!result.success) {
    return { success: false, message: "Data tidak valid" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: result.data.name,
        phone: result.data.phone,
      },
    });

    revalidatePath("/admin/profile");
    return { success: true, message: "Profil berhasil diperbarui" };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, message: "Gagal memperbarui profil" };
  }
}

export async function changeAdminPassword(data: ChangePasswordInput) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  const result = changePasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, message: "Data tidak valid" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return { success: false, message: "User tidak ditemukan" };
    }

    const isValid = await bcrypt.compare(
      result.data.oldPassword,
      user.passwordHash
    );

    if (!isValid) {
      return { success: false, message: "Password lama salah" };
    }

    const newPasswordHash = await bcrypt.hash(result.data.newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    // Create an audit log for password change if needed, but not strictly necessary here.

    return { success: true, message: "Password berhasil diubah" };
  } catch (error) {
    console.error("Failed to change password:", error);
    return { success: false, message: "Gagal mengubah password" };
  }
}
