"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Notification types that map to "system" filter bucket
const SYSTEM_TYPES: NotificationType[] = ["SYSTEM_ALERT", "LOW_STOCK_ALERT"];

export async function getAdminNotifications() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const notifications = await prisma.notification.findMany({
      where: {
        // Since we want to broadcast to all admins, userId is either null or matches this admin
        OR: [{ userId: null }, { userId: session.user.id }],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20, // Limit for dropdown
    });

    const unreadCount = await prisma.notification.count({
      where: {
        OR: [{ userId: null }, { userId: session.user.id }],
        isRead: false,
      },
    });

    return { success: true, notifications, unreadCount };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

// filter: "all" | "unread" | NotificationType | "sistem"
export async function getAllAdminNotifications(page = 1, limit = 20, filter = "all") {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const skip = (page - 1) * limit;

    const typeFilter =
      filter === "all" || filter === "unread"
        ? {}
        : filter === "sistem"
        ? { type: { in: SYSTEM_TYPES } }
        : { type: filter as NotificationType };

    const readFilter = filter === "unread" ? { isRead: false } : {};

    const where = {
      AND: [
        { OR: [{ userId: null }, { userId: session.user.id }] },
        typeFilter,
        readFilter,
      ],
    };

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return { success: true, notifications, totalCount, totalPages: Math.ceil(totalCount / limit) };
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark as read" };
  }
}

export async function markAllAdminNotificationsAsRead() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.notification.updateMany({
      where: {
        OR: [{ userId: null }, { userId: session.user.id }],
        isRead: false,
      },
      data: { isRead: true },
    });

    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: "Failed to mark all as read" };
  }
}

// Utility function to create a notification (can be called from other server actions)
export async function createAdminNotification({
  type,
  title,
  message,
  linkUrl,
  userId,
}: {
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  userId?: string | null;
}) {
  try {
    await prisma.notification.create({
      data: {
        type,
        title,
        message,
        linkUrl,
        userId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

// Send a notification to a specific user (e.g., B2B customer)
export async function createUserNotification({
  userId,
  type,
  title,
  message,
  linkUrl,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        type,
        title,
        message,
        linkUrl,
        userId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating user notification:", error);
    return { success: false, error: "Failed to create user notification" };
  }
}

export async function deleteNotification(id: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }
    await prisma.notification.delete({ where: { id } });
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function deleteAllReadNotifications() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }
    await prisma.notification.deleteMany({
      where: {
        OR: [{ userId: null }, { userId: session.user.id }],
        isRead: true,
      },
    });
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    return { success: false, error: "Failed to delete read notifications" };
  }
}

// ---------------------------------------------------------------------------
// Simulation helper (dev/testing only – not exposed in production UI)
// ---------------------------------------------------------------------------
export async function generateDummyNotification() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const types: NotificationType[] = [
      "NEW_ORDER",
      "NEW_QUOTE",
      "PAYMENT_RECEIVED",
      "BUSINESS_VERIFICATION",
      "SYSTEM_ALERT"
    ];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    let title = "Notifikasi Dummy";
    let message = "Ini adalah notifikasi dummy hasil dari klik tombol simulasi.";
    let linkUrl = "/admin/notifications";
    
    switch (randomType) {
      case "NEW_ORDER":
        title = "Pesanan Baru Simulasi";
        message = "Ada pesanan baru dari simulasi sistem.";
        linkUrl = "/admin/orders";
        break;
      case "NEW_QUOTE":
        title = "RFQ Baru Simulasi";
        message = "Permintaan penawaran baru (RFQ) masuk dari simulasi.";
        linkUrl = "/admin/quotes";
        break;
      case "PAYMENT_RECEIVED":
        title = "Pembayaran Simulasi";
        message = "Pembayaran untuk Invoice simulasi telah berhasil.";
        linkUrl = "/admin/orders";
        break;
      case "BUSINESS_VERIFICATION":
        title = "Verifikasi Bisnis Simulasi";
        message = "Akun bisnis baru mendaftar pada sistem simulasi.";
        linkUrl = "/admin/verifications";
        break;
      case "SYSTEM_ALERT":
        title = "Peringatan Sistem Simulasi";
        message = "Ini adalah pesan peringatan sistem dari tombol simulasi.";
        linkUrl = "/admin/products";
        break;
    }

    await prisma.notification.create({
      data: {
        type: randomType,
        title,
        message,
        linkUrl,
      },
    });

    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error generating dummy notification:", error);
    return { success: false, error: "Failed to generate notification" };
  }
}
