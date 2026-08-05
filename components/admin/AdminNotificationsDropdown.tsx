"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell, Check, Package, FileText, DollarSign, AlertCircle,
  Building2, ExternalLink, TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  getAdminNotifications,
  markNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from "@/lib/actions/notifications";
import { NotificationType } from "@prisma/client/browser";

const POLL_INTERVAL_MS = 30_000;

function formatTimeAgo(dateString: Date) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "Baru saja";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} menit yang lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari yang lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function getIconForType(type: NotificationType) {
  switch (type) {
    case "NEW_ORDER":              return <Package      className="h-4 w-4 text-blue-600" />;
    case "NEW_QUOTE":              return <FileText     className="h-4 w-4 text-purple-600" />;
    case "PAYMENT_RECEIVED":       return <DollarSign   className="h-4 w-4 text-emerald-600" />;
    case "BUSINESS_VERIFICATION":  return <Building2    className="h-4 w-4 text-amber-600" />;
    case "LOW_STOCK_ALERT":        return <TrendingDown className="h-4 w-4 text-orange-600" />;
    case "SYSTEM_ALERT":           return <AlertCircle  className="h-4 w-4 text-red-600" />;
    default:                       return <Bell         className="h-4 w-4 text-slate-600" />;
  }
}

export function AdminNotificationsDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    const result = await getAdminNotifications();
    if (result.success && result.notifications) {
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount ?? 0);
    }
    setIsLoading(false);
  }, []);

  // Start / stop polling based on page visibility
  useEffect(() => {
    fetchNotifications();

    const startPolling = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) stopPolling();
      else { fetchNotifications(); startPolling(); }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchNotifications]);

  // Re-fetch when dropdown opens
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    await markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllAdminNotificationsAsRead();
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await markNotificationAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-500 hover:text-blue-950 hover:bg-slate-100 focus-visible:ring-2"
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 md:w-96 p-0" collisionPadding={16}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-slate-900">Notifikasi</span>
            <span className="text-xs text-slate-500">
              {unreadCount > 0
                ? `${unreadCount} pesan belum dibaca`
                : "Tidak ada pesan baru"}
            </span>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={handleMarkAllAsRead}
            >
              Tandai semua dibaca
            </Button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="h-[350px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500 space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              <p className="text-sm">Memuat notifikasi...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500 space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-slate-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">Belum ada notifikasi</p>
                <p className="text-xs text-slate-500">Kami akan memberi tahu Anda jika ada aktivitas baru.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div key={notification.id}>
                  {notification.linkUrl ? (
                    <Link
                      href={notification.linkUrl}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors relative group",
                        !notification.isRead ? "bg-blue-50/50" : ""
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                        !notification.isRead ? "bg-white shadow-sm" : "bg-slate-100"
                      )}>
                        {getIconForType(notification.type)}
                      </div>
                      <div className="flex flex-col gap-1 pr-6">
                        <p className={cn(
                          "text-sm",
                          !notification.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                        )}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2">{notification.message}</p>
                        <span className="text-[11px] font-medium text-slate-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      {!notification.isRead && (
                        <div className="absolute right-4 top-4 flex h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </Link>
                  ) : (
                    <div className={cn(
                      "flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors relative group",
                      !notification.isRead ? "bg-blue-50/50" : ""
                    )}>
                      <div className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                        !notification.isRead ? "bg-white shadow-sm" : "bg-slate-100"
                      )}>
                        {getIconForType(notification.type)}
                      </div>
                      <div className="flex flex-col gap-1 pr-6">
                        <p className={cn(
                          "text-sm",
                          !notification.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                        )}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2">{notification.message}</p>
                        <span className="text-[11px] font-medium text-slate-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-6 w-6 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          title="Tandai dibaca"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                  <DropdownMenuSeparator className="m-0" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 bg-slate-50 border-t border-slate-100">
          <Link href="/admin/notifications" onClick={() => setIsOpen(false)}>
            <Button
              variant="ghost"
              className="w-full text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 justify-center h-8"
            >
              Lihat Semua Notifikasi
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
